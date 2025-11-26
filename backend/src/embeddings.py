from langchain.embeddings.base import Embeddings
import os
from dotenv import load_dotenv
import requests
import time
load_dotenv()

# Configure logging
from backend.src.logger import setup_logger

logger = setup_logger(__name__)



class OpenRouterEmbeddings(Embeddings):
    def __init__(self, api_key: str = None, model: str = None):
        self.api_key = api_key or os.getenv('OPENROUTER_API_KEY')
        self.model = model or os.getenv('EMBEDDING_MODEL_NAME')
        self.url = os.getenv('EMBEDDING_URL', 'https://openrouter.ai/api/v1/embeddings')
        
        # Validate required parameters
        if not self.api_key:
            raise ValueError("OPENROUTER_API_KEY is required")
        if not self.model:
            raise ValueError("EMBEDDING_MODEL_NAME is required")
            
        logger.info(f"OpenRouterEmbeddings initialized with model: {self.model}")

    def embed_documents(self, texts):
        """Embed a list of documents with batching"""
        start_time = time.time()
        logger.info(f"Embedding {len(texts)} documents")
        
        all_embeddings = []
        batch_size = 20  # Reduced batch size to stay within token limits
        total_batches = (len(texts) + batch_size - 1) // batch_size
        
        for i in range(0, len(texts), batch_size):
            batch_texts = texts[i:i + batch_size]
            current_batch = i // batch_size + 1
            logger.info(f"Processing batch {current_batch}/{total_batches} ({len(batch_texts)} documents)")
            
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "HTTP-Referer": "http://localhost",
                "X-Title": "RAG-System",
                "Content-Type": "application/json"
            }

            payload = {
                "model": self.model,
                "input": batch_texts
            }

            try:
                batch_start = time.time()
                logger.debug(f"Sending request to {self.url} with {len(batch_texts)} texts")
                response = requests.post(self.url, headers=headers, json=payload)
                response.raise_for_status()
                data = response.json()
                
                if "error" in data:
                    raise ValueError(f"API Error: {data['error']}")
                
                batch_embeddings = [item["embedding"] for item in data["data"]]
                all_embeddings.extend(batch_embeddings)
                logger.debug(f"Batch {current_batch} processed in {time.time() - batch_start:.2f}s")
                
                # Small delay to avoid rate limits
                time.sleep(0.1)
                
            except requests.exceptions.RequestException as e:
                logger.error(f"API request failed: {e}")
                # logger.error(f"Request payload: {payload}") # Payload might be too large to log
                raise
            except KeyError as e:
                logger.error(f"Unexpected response format: {e}")
                logger.error(f"Response data: {data}")
                raise
            except Exception as e:
                logger.error(f"Unexpected error during document embedding: {e}")
                raise

        logger.info(f"Successfully embedded {len(texts)} documents total in {time.time() - start_time:.2f}s")
        return all_embeddings

    def embed_query(self, text):
        """Embed a single query - returns a single vector"""
        start_time = time.time()
        logger.info("Embedding single query")
        logger.debug(f"Query text: {text[:100]}...")  # Log first 100 chars
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "HTTP-Referer": "http://localhost",
            "X-Title": "RAG-System",
            "Content-Type": "application/json"
        }

        payload = {
            "model": self.model,
            "input": text
        }

        try:
            logger.debug(f"Sending request to {self.url}")
            response = requests.post(self.url, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
            
            embedding = data["data"][0]["embedding"]
            logger.info(f"Successfully embedded query. Vector dimension: {len(embedding)}. Time: {time.time() - start_time:.2f}s")
            return embedding
            
        except requests.exceptions.RequestException as e:
            logger.error(f"API request failed: {e}")
            logger.error(f"Request payload: {payload}")
            raise
        except KeyError as e:
            logger.error(f"Unexpected response format: {e}")
            logger.error(f"Response data: {data}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error during query embedding: {e}")
            raise

    def _embed_single(self, text):
        """Helper method for single embedding"""
        logger.debug("Using _embed_single helper method")
        return self.embed_query(text)

# Usage with proper error handling
if __name__ == "__main__":
    try:
        logger.info("Initializing OpenRouterEmbeddings")
        EMBEDDINGS_MODEL = OpenRouterEmbeddings()
    
        logger.info("Testing embedding functionality")
        result = EMBEDDINGS_MODEL.embed_query("Hello world")
    
        logger.info(f"Embedding test successful. Dimension: {len(result)}")
        logger.debug(f"First 5 embedding values: {result[:5]}")
    
        # Test batch embedding
        logger.info("Testing batch embedding")
        batch_result = EMBEDDINGS_MODEL.embed_documents(["Hello world", "Goodbye world"])
        logger.info(f"Batch embedding successful. Results: {len(batch_result)} vectors")
        # print(result)
    
    except Exception as e:
        logger.error(f"Failed to initialize or test embeddings: {e}")
        raise
