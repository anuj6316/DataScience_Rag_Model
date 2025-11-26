from langchain_qdrant import Qdrant
from qdrant_client import QdrantClient
from langchain_astradb import AstraDBVectorStore

from openrouter_embedding_config import OpenRouterEmbeddings
from utills import load_docs, split_docs

import os
from dotenv import load_dotenv
load_dotenv()

from tqdm import tqdm
import logging

logger = logging.getLogger(__name__)

from astrapy import DataAPIClient
from astrapy.info import CollectionDefinition, CollectionVectorOptions


# CONFIG
EMBEDDINGS_MODEL = OpenRouterEmbeddings(
    api_key=os.getenv('OPENROUTER_API_KEY'),
    model=os.getenv('EMBEDDING_MODEL_NAME')
)

VECTORSTORE = AstraDBVectorStore(
    collection_name=os.getenv('QDRANT_COLLECTION_NAME'),
    embedding=EMBEDDINGS_MODEL,
    api_endpoint=os.getenv('ASTRA_DB_API_ENDPOINT'),
    token=os.getenv('ASTRA_DB_API_KEY'),
    content_field="text",  # Explicitly specify the content field name
    setup_mode="ASYNC",  # Use existing collection without validation
)
QDRANT_HOST = "localhost"
QDRANT_PORT = 6333


# Initialize the client
client = DataAPIClient()
# Get the database
db = client.get_database(
  os.getenv('ASTRA_DB_API_ENDPOINT'),
  token=os.getenv('ASTRA_DB_API_KEY'),
)
# Ensure collection exists with correct dimension (4096)
collection_name = os.getenv('QDRANT_COLLECTION_NAME')
desired_dim = 4096
# Drop existing collection if it exists (ignore errors if it does not)
try:
    db.drop_collection(collection_name)
    logger.info(f"Dropped existing collection '{collection_name}'.")
except Exception:
    logger.info(f"Collection '{collection_name}' did not exist or could not be dropped.")
# Create collection with the desired vector dimension
definition = CollectionDefinition(vector=CollectionVectorOptions(dimension=desired_dim))
db.create_collection(collection_name, definition=definition)
logger.info(f"Created collection '{collection_name}' with dimension {desired_dim}.")


print(f"Connected to Astra DB. Collections: {db.list_collection_names()}")



def process_vectorstore():
    docs = load_docs()
    chunks = split_docs(docs)
    
    batch_size = 500
    total_chunks = len(chunks)
    
    print(f"Processing {total_chunks} chunks in batches of {batch_size}...")
    
    for i in tqdm(range(0, total_chunks, batch_size), desc="Adding to VectorStore"):
        batch_chunks = chunks[i:i + batch_size]
        VECTORSTORE.add_documents(batch_chunks)
        
    return "Documents processed and added to vectorstore"

if __name__=='__main__':
    process_vectorstore()