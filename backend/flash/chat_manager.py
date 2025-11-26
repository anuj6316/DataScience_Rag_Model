import asyncio
import os
import time
from typing import Any, Dict, List

from dotenv import load_dotenv
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI

from backend.flash.logger_config import logger
from backend.flash.query_decomposition import decompose_query
from backend.flash.retriever import rerank_documents, retrieve_documents
from backend.flash.chat_template import template
from backend.flash.suggestions import generate_suggestions

load_dotenv()

# Initialize LLMs using OpenRouter
# Mapping user request "gemini-2.5" to available OpenRouter models (likely 2.0 flash/pro)
google_flash = ChatGoogleGenerativeAI(model="gemini-2.5-flash")
google_pro = ChatGoogleGenerativeAI(model="gemini-2.5-pro")
openrouter_grok = ChatOpenAI(model="x-ai/grok-4.1-fast", openai_api_key=os.getenv("OPENROUTER_API_KEY"), base_url="https://openrouter.ai/api/v1",)
ollama_qwen3_coder = ChatOpenAI(
    model='qwen3-coder:480b-cloud',
    api_key='ollama',
    base_url='http://localhost:11434/v1',
)
gpt_oss_120b_cloud = ChatOpenAI(
    model='gpt-oss:120b-cloud',
    api_key='gpt-oss',
    base_url='http://localhost:11434/v1',
)

async def process_query(query: str, model_name: str = "google_flash", chat_history: List[Dict[str, str]] = None) -> Dict[str, Any]:
    """
    Process the user query through the full RAG pipeline with logging and metrics.
    """
    start_time = time.time()
    logger.info(f"Processing query: {query} with model: {model_name}")

    metrics = {}

    # 1. Query Decomposition
    decomp_start = time.time()
    sub_queries = decompose_query(query)
    metrics["decomposition_time"] = f"{time.time() - decomp_start:.2f}s"

    # 2. Document Retrieval
    retrieval_start = time.time()
    logger.info("Retrieving documents...")
    retrieved_docs = await retrieve_documents(sub_queries)
    metrics["retrieval_time"] = f"{time.time() - retrieval_start:.2f}s"
    logger.info(f"Retrieved {len(retrieved_docs)} documents.")

    # 3. Flash Reranking
    rerank_start = time.time()
    logger.info("Reranking documents...")
    top_docs = rerank_documents(query, retrieved_docs, top_k=3)
    metrics["rerank_time"] = f"{time.time() - rerank_start:.2f}s"
    logger.info(f"Top {len(top_docs)} documents selected.")

    # 4. Context Formatting
    context_text = ""
    diagram_images = []

    for i, doc in enumerate(top_docs):
        context_text += f"\n--- Document {i + 1} ---\n{doc.page_content}\n{doc.metadata}"
        if "diagram_images" in doc.metadata and doc.metadata["diagram_images"]:
            images = doc.metadata["diagram_images"]
            if isinstance(images, list):
                diagram_images.extend(images)
            elif isinstance(images, str):
                diagram_images.append(images)

    # 5. Response Generation (Single Model Based on Selection)
    llm_start = time.time()
    logger.info(f"Generating response using model: {model_name}")

    # Format chat history
    formatted_history = ""
    if chat_history:
        for msg in chat_history:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            formatted_history += f"{role.capitalize()}: {content}\n"

    prompt = ChatPromptTemplate.from_template(template)

    # Select the appropriate model based on user's choice
    model_map = {
        "google_flash": google_flash,
        "google_pro": google_pro,
        "openrouter_grok": openrouter_grok, 
        "ollama_qwen3_coder": ollama_qwen3_coder,
        "gpt-oss:120b-cloud": gpt_oss_120b_cloud,
    }
    
    # Get selected model, default to google_flash if invalid
    selected_model = model_map.get(model_name, google_flash)
    actual_model_name = model_name if model_name in model_map else "google_flash"
    
    # Create chain for ONLY the selected model
    chain = prompt | selected_model | StrOutputParser()

    try:
        # Invoke only the selected model
        response = await chain.ainvoke({
            "context": context_text, 
            "query": query,
            "chat_history": formatted_history
        })
        metrics["llm_time"] = f"{time.time() - llm_start:.2f}s"

        total_time = time.time() - start_time
        metrics["total_time"] = f"{total_time:.2f}s"

        logger.info(f"Query processed in {total_time:.2f}s using {actual_model_name}")

        # Convert file paths to URLs for frontend
        def path_to_url(file_path: str) -> str:
            """Convert a file path to a URL that the frontend can use."""
            if not file_path:
                return ""
            
            # Extract just the filename from various path formats
            # Handles: /content/drive/.../filename.png, /home/.../filename.png, or just filename.png
            import os
            filename = os.path.basename(file_path)
            
            # Return URL pointing to our image serving endpoint
            return f"http://localhost:8000/images/{filename}"
        
        # Convert all diagram image paths to URLs
        diagram_image_urls = [path_to_url(img) for img in diagram_images if img]
        # Remove duplicates while preserving order
        seen = set()
        unique_urls = []
        for url in diagram_image_urls:
            if url and url not in seen:
                seen.add(url)
                unique_urls.append(url)

        # 6. Generate Related Questions (Parallel or Sequential)
        # For simplicity, sequential here, but could be parallelized with asyncio.gather if needed
        related_questions = []
        try:
            # Use the generated response as context for suggestions if available, or just the retrieved docs
            suggestion_context = response if response else context_text
            related_questions = generate_suggestions(query, suggestion_context)
        except Exception as e:
            logger.error(f"Failed to generate related questions: {e}")

        return {
            "query": query,
            "response": response,
            "model_used": actual_model_name,
            "context": context_text,
            "sub_queries": sub_queries,
            "related_questions": related_questions,
            "diagram_images": unique_urls,
            "metrics": metrics,
            "response_time": metrics["total_time"],
        }

    except Exception as e:
        logger.error(f"Error generating response: {e}")
        return {
            "query": query,
            "response": "An error occurred while processing your request.",
            "error": str(e),
        }

async def process_query_stream(query: str, model_name: str = "google_flash", chat_history: List[Dict[str, str]] = None):
    """
    Process the user query and yield streaming response chunks.
    Yields:
        Dict: {"type": "token", "content": "..."} or {"type": "complete", "data": {...}}
    """
    start_time = time.time()
    logger.info(f"Processing query stream: {query} with model: {model_name}")

    metrics = {}

    try:
        # 1. Query Decomposition
        yield {"type": "status", "content": "Decomposing your query..."}
        decomp_start = time.time()
        sub_queries = decompose_query(query)
        metrics["decomposition_time"] = f"{time.time() - decomp_start:.2f}s"

        # 2. Document Retrieval
        yield {"type": "status", "content": "Searching knowledge base..."}
        retrieval_start = time.time()
        logger.info("Retrieving documents...")
        retrieved_docs = await retrieve_documents(sub_queries)
        metrics["retrieval_time"] = f"{time.time() - retrieval_start:.2f}s"
        logger.info(f"Retrieved {len(retrieved_docs)} documents.")

        # 3. Flash Reranking
        yield {"type": "status", "content": "Reading and ranking documents..."}
        rerank_start = time.time()
        logger.info("Reranking documents...")
        top_docs = rerank_documents(query, retrieved_docs, top_k=3)
        metrics["rerank_time"] = f"{time.time() - rerank_start:.2f}s"
        logger.info(f"Top {len(top_docs)} documents selected.")

        # 4. Context Formatting
        context_text = ""
        diagram_images = []

        for i, doc in enumerate(top_docs):
            context_text += f"\n--- Document {i + 1} ---\n{doc.page_content}\n{doc.metadata}"
            if "diagram_images" in doc.metadata and doc.metadata["diagram_images"]:
                images = doc.metadata["diagram_images"]
                if isinstance(images, list):
                    diagram_images.extend(images)
                elif isinstance(images, str):
                    diagram_images.append(images)

        # 5. Response Generation (Streaming)
        yield {"type": "status", "content": "Generating response..."}
        llm_start = time.time()
        logger.info(f"Generating streaming response using model: {model_name}")

        # Format chat history
        formatted_history = ""
        if chat_history:
            for msg in chat_history:
                role = msg.get("role", "user")
                content = msg.get("content", "")
                formatted_history += f"{role.capitalize()}: {content}\n"

        prompt = ChatPromptTemplate.from_template(template)

        # Select the appropriate model based on user's choice
        model_map = {
            "google_flash": google_flash,
            "google_pro": google_pro,
            "openrouter_grok": openrouter_grok, 
            "ollama_qwen3_coder": ollama_qwen3_coder,
            "gpt-oss:120b-cloud": gpt_oss_120b_cloud,
        }
        
        # Get selected model, default to google_flash if invalid
        selected_model = model_map.get(model_name, google_flash)
        actual_model_name = model_name if model_name in model_map else "google_flash"
        
        # Create chain for ONLY the selected model
        chain = prompt | selected_model | StrOutputParser()

        full_response = ""
        
        # Stream the response
        async for chunk in chain.astream({
            "context": context_text, 
            "query": query,
            "chat_history": formatted_history
        }):
            full_response += chunk
            yield {"type": "token", "content": chunk}

        metrics["llm_time"] = f"{time.time() - llm_start:.2f}s"
        total_time = time.time() - start_time
        metrics["total_time"] = f"{total_time:.2f}s"

        logger.info(f"Query processed in {total_time:.2f}s using {actual_model_name}")

        # Convert file paths to URLs for frontend
        def path_to_url(file_path: str) -> str:
            """Convert a file path to a URL that the frontend can use."""
            if not file_path:
                return ""
            import os
            filename = os.path.basename(file_path)
            return f"http://localhost:8000/images/{filename}"
        
        # Convert all diagram image paths to URLs
        diagram_image_urls = [path_to_url(img) for img in diagram_images if img]
        # Remove duplicates while preserving order
        seen = set()
        unique_urls = []
        for url in diagram_image_urls:
            if url and url not in seen:
                seen.add(url)
                unique_urls.append(url)

        # 6. Generate Related Questions (Sequential)
        related_questions = []
        try:
            suggestion_context = full_response if full_response else context_text
            related_questions = generate_suggestions(query, suggestion_context)
        except Exception as e:
            logger.error(f"Failed to generate related questions: {e}")

        # Yield final complete message
        yield {
            "type": "complete",
            "data": {
                "query": query,
                "response": full_response,
                "model_used": actual_model_name,
                "context": context_text,
                "sub_queries": sub_queries,
                "related_questions": related_questions,
                "diagram_images": unique_urls,
                "metrics": metrics,
                "response_time": metrics["total_time"],
            }
        }

    except Exception as e:
        logger.error(f"Error generating streaming response: {e}")
        yield {
            "type": "error",
            "error": str(e)
        }


if __name__ == "__main__":
    import asyncio

    async def main():
        query = ""
        result = await process_query(query)
        print("\n=== Result ===\n")
        print(result)

    asyncio.run(main())
