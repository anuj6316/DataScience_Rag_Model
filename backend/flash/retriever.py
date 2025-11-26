import asyncio
from typing import List
from langchain_core.documents import Document
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from flashrank import Ranker, RerankRequest
from backend.flash.config import EMBEDDING_FUNCTION, QDRANT_HOST, QDRANT_PORT

from langchain_community.retrievers import BM25Retriever
# from langchain.retrievers import EnsembleRetriever  # Not available in current installation

# Initialize Qdrant Client and VectorStore
client = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)
vectorstore = QdrantVectorStore(
    client=client,
    collection_name="docling_praser",
    embedding=EMBEDDING_FUNCTION,
)

# Initialize FlashRank
ranker = Ranker()

# ============================================================================
# ENSEMBLE RETRIEVAL CONFIGURATION
# ============================================================================
DENSE_K = 4  # Documents from dense retriever
SPARSE_K = 4  # Documents from BM25 retriever
RRF_K = 60  # Reciprocal Rank Fusion constant
FINAL_K = 5  # Final documents after fusion

# ============================================================================
# RECIPROCAL RANK FUSION (RRF)
# ============================================================================
def reciprocal_rank_fusion(
    retriever_results: List[List[Document]], 
    k: int = RRF_K
) -> List[Document]:
    """
    Merge and re-rank documents from multiple retrievers using Reciprocal Rank Fusion.
    
    RRF Formula: score(doc) = sum(1 / (k + rank_i)) for all retrievers i
    
    Args:
        retriever_results: List of document lists from different retrievers
        k: RRF constant (default 60)
    
    Returns:
        List of documents sorted by RRF score (highest first)
    """
    doc_scores = {}  # {doc_content: (Document, score)}
    
    for retriever_docs in retriever_results:
        for rank, doc in enumerate(retriever_docs, start=1):
            content_key = doc.page_content
            rrf_score = 1.0 / (k + rank)
            
            if content_key in doc_scores:
                doc_scores[content_key] = (doc, doc_scores[content_key][1] + rrf_score)
            else:
                doc_scores[content_key] = (doc, rrf_score)
    
    sorted_docs = sorted(doc_scores.values(), key=lambda x: x[1], reverse=True)
    return [doc for doc, score in sorted_docs]


# ============================================================================
# INITIALIZE BM25 SPARSE RETRIEVER
# ============================================================================
print("Loading documents for BM25 retriever...")
try:
    # Get all documents from Qdrant collection
    collection_name = "docling_praser"
    scroll_result = client.scroll(
        collection_name=collection_name,
        limit=10000,  # Adjust based on your collection size
        with_payload=True,
        with_vectors=False
    )
    
    # Convert Qdrant points to LangChain Documents
    bm25_docs = []
    for point in scroll_result[0]:
        if point.payload:
            content = point.payload.get('page_content', '')
            metadata = point.payload.get('metadata', {})
            if content:
                bm25_docs.append(Document(page_content=content, metadata=metadata))
    
    if bm25_docs:
        bm25_retriever = BM25Retriever.from_documents(bm25_docs)
        bm25_retriever.k = SPARSE_K
        print(f"✓ BM25 retriever initialized with {len(bm25_docs)} documents")
    else:
        print("⚠ No documents found for BM25. Using dense-only retrieval.")
        bm25_retriever = None
except Exception as e:
    print(f"✗ Failed to initialize BM25: {e}")
    bm25_retriever = None


# ============================================================================
# ENSEMBLE RETRIEVAL FUNCTION
# ============================================================================
async def ensemble_retrieve(query: str, top_k: int = FINAL_K) -> List[Document]:
    """
    Perform ensemble retrieval combining dense (vector) and sparse (BM25) search.
    
    Args:
        query: Search query
        top_k: Number of documents to return
    
    Returns:
        List of top-k documents after RRF fusion
    """
    retriever_results = []
    
    # Dense retrieval (vector/semantic)
    dense_retriever = vectorstore.as_retriever(search_kwargs={"k": DENSE_K})
    
    # Define async tasks
    async def run_dense():
        try:
            return await dense_retriever.ainvoke(query)
        except Exception as e:
            print(f"Dense retrieval failed: {e}")
            return []

    async def run_sparse():
        if bm25_retriever:
            try:
                return await bm25_retriever.ainvoke(query)
            except Exception as e:
                print(f"Sparse retrieval failed: {e}")
                return []
        return []

    # Run both retrievers in parallel
    results = await asyncio.gather(run_dense(), run_sparse())
    
    if results[0]:
        retriever_results.append(results[0])
    if results[1]:
        retriever_results.append(results[1])
    
    # Merge with RRF
    if not any(retriever_results):
        return []
    
    fused_docs = reciprocal_rank_fusion(retriever_results)
    return fused_docs[:top_k]


async def retrieve_documents(sub_queries: List[str]) -> List[Document]:
    """
    Retrieves documents for each sub-query using ensemble retrieval and merges the results.
    Combines dense (vector) and sparse (BM25) retrieval with RRF fusion.
    Runs retrieval for all sub-queries in parallel.
    """
    all_documents = []
    seen_content = set()
    
    # Create tasks for all sub-queries
    tasks = [ensemble_retrieve(query, top_k=FINAL_K) for query in sub_queries]
    
    # Run all tasks in parallel
    results = await asyncio.gather(*tasks)
    
    for docs in results:
        for doc in docs:
            # Deduplication based on page_content
            if doc.page_content not in seen_content:
                all_documents.append(doc)
                seen_content.add(doc.page_content)
                
    return all_documents

def rerank_documents(query: str, documents: List[Document], top_k: int = 5) -> List[Document]:
    """
    Reranks the retrieved documents using FlashRank.
    """
    if not documents:
        return []
        
    # Prepare data for FlashRank
    passages = [
        {"id": str(i), "text": doc.page_content, "meta": doc.metadata} 
        for i, doc in enumerate(documents) 
    ]
    
    rerank_request = RerankRequest(query=query, passages=passages)
    results = ranker.rerank(rerank_request)
    
    # Sort results by score and take top_k
    results = sorted(results, key=lambda x: x['score'], reverse=True)[:top_k]
    
    # Reconstruct Document objects
    reranked_docs = []
    for res in results:
        # FlashRank might return 'meta' or we might need to look it up. 
        # The 'meta' field in passage is passed through.
        metadata = res.get('meta', {})
        reranked_docs.append(Document(page_content=res['text'], metadata=metadata))
        
    return reranked_docs

if __name__ == "__main__":
    queries = [
        "quickstart code for intializing the gemini chat model"
    ]

    for query in queries:
        print(f"Processing query: {query}")
        result = retrieve_documents([query])
        
        # Save results to a file
        filename = f"results_{query.replace(' ', '_')[:50]}.txt"  # Truncate filename if too long
        with open(filename, 'w') as f:
            f.write(f"Query: {query}\n\n")
            for i, doc in enumerate(result):
                f.write(f'Document number: {i+1}\n{doc.page_content}\n\n')
        
        print(f"Found {len(result)} documents for query: {query}")
        print("-" * 50)
        for doc in result:
            print(doc.page_content)
    
    
