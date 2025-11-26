from backend.src.query_decomposition import process_query_decomposition
from backend.src.vector_store import VECTORSTORE
import requests
import json
import os
from dotenv import load_dotenv
from backend.src.utils import format_docs
from backend.src.logger import setup_logger

load_dotenv()
logger = setup_logger(__name__)

retriver = VECTORSTORE.as_retriever(
    search_type="mmr",
    search_kwargs={
        "k": 5,
        "fetch_k": 20,
        "lambda_mult": 0.5
    }
)

def process_query_retriever(queries):
    logger.info(f"Retrieving documents for {len(queries)} sub-queries")
    ans = []
    # decomposed_queries = process_query_decomposition(queries)
    for query in queries:
        logger.debug(f"Retrieving for sub-query: {query}")
        ans.append({
            'query': query,
            'context': retriver.invoke(query)
        })
    logger.info("Retrieval completed")
    return ans

def rerank_context(query, context):
    logger.info(f"Reranking {len(context)} documents for query: {query}")
    url = "https://api.jina.ai/v1/rerank"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {os.getenv('JINA_API_KEY')}"
    }
    data = {
        "model": "jina-reranker-v3",
        "query": query,
        "top_n": 5,
        "documents": context,
        "return_documents": True
    }  
    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        logger.info("Reranking completed successfully")
        return response.json()
    except Exception as e:
        logger.error(f"Reranking failed: {e}")
        raise

def main():
    query = "what is machine learning and what are it applications?"
    queries = process_query_decomposition(query)
    queries = process_query_retriever(queries)
    for i in queries:
        i['context'] = format_docs(i['context'])
    
    print(queries)

if __name__ == "__main__":
    main()