from langchain_huggingface import HuggingFaceEmbeddings

EMBEDDING_MODEL = 'all-MiniLM-L6-v2'
KNOWLEDGE_BASE_PATH = './knowledge_base'
EMBEDDING_DIM = 384
EMBEDDING_FUNCTION = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)

QDRANT_HOST = "localhost"
QDRANT_PORT = 6333
if __name__ == '__main__':
    print(EMBEDDING_FUNCTION.embed_query('Hello World'))

