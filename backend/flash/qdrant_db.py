from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient, models

from config import (
    EMBEDDING_FUNCTION,
    QDRANT_HOST,
    QDRANT_PORT,
)


client = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT, grpc_options={"grpc_port": 6334})

# if client.collection_exists("docling_praser"):
#     print('collection is present') 
# else:
#     print('xxx')

import json
from langchain_text_splitters import MarkdownTextSplitter
from langchain_core.documents import Document

# Initialize text splitter
text_splitter = MarkdownTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
)

# Load knowledge path
knowledge_path = "/home/anuj/DataScience_Rag_Model/data/knowledge_base_stream_processed.jsonl"

documents = []

print("Processing knowledge base...")
with open(knowledge_path, "r") as f:
    for line in f:
        try:
            data = json.loads(line)
            text_content = data.get("text_content", "")
            
            if not text_content:
                continue
                
            # Prepare metadata
            metadata = {
                "source_file": data.get("source_file"),
                "file_path": data.get("file_path"),
                "page_number": data.get("page_number"),
                "diagram_images": data.get("diagram_images"),
                "has_code": data.get("has_code")
            }
            
            # Create chunks
            chunks = text_splitter.split_text(text_content)
            
            # Create Document objects for each chunk
            for chunk in chunks:
                documents.append(Document(page_content=chunk, metadata=metadata))
                
        except json.JSONDecodeError:
            print(f"Error decoding JSON line: {line[:50]}...")
            continue

print(f"Created {len(documents)} document chunks.")

if documents:
    print("Ingesting documents into Qdrant...")
    VECTORSTORE = QdrantVectorStore.from_documents(
        documents=documents,
        embedding=EMBEDDING_FUNCTION,
        url=f"http://{QDRANT_HOST}:{QDRANT_PORT}",
        collection_name="docling_praser",
        force_recreate=True # Optional: Set to True if you want to overwrite the collection each time
    )
    print("Ingestion complete!")
else:
    print("No documents to ingest.")