from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient, models
import uuid

from backend.src.embeddings import OpenRouterEmbeddings
from backend.src.utils import load_docs, split_docs
import os
from dotenv import load_dotenv
load_dotenv()
from tqdm import tqdm
from backend.src.logger import setup_logger

logger = setup_logger(__name__)

# Initialize the client
QDRANT_CLIENT = QdrantClient(
    # api_key=os.getenv('QDRANT_API_KEY'),
    # url=os.getenv('QDRANT_URL')
    url="http://localhost:6333"
)

# Ensure collection exists with correct dimension (4096)
collection_name = os.getenv('QDRANT_COLLECTION_NAME')
desired_dim = 4096


def ensure_collection_exists():
    try:
        collections = QDRANT_CLIENT.get_collections()
        exists = any(c.name == collection_name for c in collections.collections)
        
        if not exists:
            logger.info(f"Collection '{collection_name}' does not exist. Creating it...")
            QDRANT_CLIENT.create_collection(
                collection_name=collection_name,
                vectors_config=models.VectorParams(
                    size=desired_dim,
                    distance=models.Distance.COSINE
                )
            )
            logger.info(f"Created collection '{collection_name}' with dimension {desired_dim}.")
        else:
            logger.info(f"Collection '{collection_name}' already exists.")
    except Exception as e:
        logger.error(f"Error checking/creating collection: {e}")
        raise


# Ensure collection exists before initializing VectorStore
ensure_collection_exists()

EMBEDDINGS_MODEL = OpenRouterEmbeddings(
    api_key=os.getenv('OPENROUTER_API_KEY'),
    model=os.getenv('EMBEDDING_MODEL_NAME')
)

VECTORSTORE = QdrantVectorStore(
    collection_name=os.getenv('QDRANT_COLLECTION_NAME'),
    embedding=EMBEDDINGS_MODEL,
    client=QDRANT_CLIENT,
)

def generate_id(content):
    # Create a deterministic ID based on the content using UUIDv5
    # Using a constant namespace for consistency
    NAMESPACE_UUID = uuid.UUID('12345678-1234-5678-1234-567812345678')
    return str(uuid.uuid5(NAMESPACE_UUID, content))


import time


def process_vectorstore():
    start_time = time.time()
    ensure_collection_exists()
    
    docs = load_docs()
    chunks = split_docs(docs)
    
    if not chunks:
        logger.info("No documents to process.")
        return "No documents to process"

    batch_size = 500
    total_chunks = len(chunks)
    
    logger.info(f"Processing {total_chunks} chunks in batches of {batch_size}...")

    total_added = 0
    
    for i in tqdm(range(0, total_chunks, batch_size), desc="Processing batches"):
        batch_start = time.time()
        batch_chunks = chunks[i:i + batch_size]

        # Generate IDs for the batch
        batch_ids = [generate_id(chunk.page_content) for chunk in batch_chunks]
        
        # Check which IDs already exist in Qdrant
        try:
            # Qdrant retrieve returns list of Record, we just need to know if it exists
            existing_points = QDRANT_CLIENT.retrieve(
                collection_name=collection_name,
                ids=batch_ids,
                with_payload=False,
                with_vectors=False
            )
            existing_ids = set(point.id for point in existing_points)
        except Exception as e:
            logger.error(f"Error checking existing documents: {e}")
            # If check fails, assume none exist to be safe, or handle otherwise
            existing_ids = set()

        # Filter out chunks that already exist
        new_chunks = []
        new_ids = []

        for chunk, doc_id in zip(batch_chunks, batch_ids):
            if doc_id not in existing_ids:
                new_chunks.append(chunk)
                new_ids.append(doc_id)

        if new_chunks:
            VECTORSTORE.add_documents(new_chunks, ids=new_ids)
            total_added += len(new_chunks)
            logger.info(f"Batch {i // batch_size + 1}: Added {len(new_chunks)} new documents. Time: {time.time() - batch_start:.2f}s")
        else:
            logger.info(f"Batch {i // batch_size + 1}: All documents already exist. Skipping. Time: {time.time() - batch_start:.2f}s")
        
    logger.info(f"Total new documents added: {total_added}. Total Time: {time.time() - start_time:.2f}s")
    return f"Processed {total_chunks} chunks. Added {total_added} new documents."


if __name__ == '__main__':
    process_vectorstore()