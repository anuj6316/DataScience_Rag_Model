from backend.src.vector_store import VECTORSTORE, EMBEDDINGS_MODEL
from backend.src.response_prompt import prompt
from backend.src.query_decomposition import process_query_decomposition
from backend.src.retrieval import process_query_retriever, rerank_context
from backend.src.utils import format_docs, get_reranked_with_metadata
from backend.src.logger import setup_logger

from langchain_google_genai import GoogleGenerativeAI
from langchain_core.output_parsers import PydanticOutputParser, StrOutputParser
from pydantic import BaseModel
from langchain_core.prompts import ChatPromptTemplate
import os
from dotenv import load_dotenv
load_dotenv()

# config
GOOGLE_MODEL_NAME="gemini-2.5-flash"
logger = setup_logger(__name__)

class Response(BaseModel):
    answer: str
    sources: list[str]

response_parser = PydanticOutputParser(pydantic_object=Response)

prompt_template = ChatPromptTemplate.from_template(
    prompt,
    partial_variables=
        {
            "parser": response_parser.get_format_instructions()
        }
)

root_model = GoogleGenerativeAI(
    api_key=os.getenv('GOOGLE_API_KEY'),
    model=GOOGLE_MODEL_NAME
)

import time

def final_response(query, final_context):
    logger.info("Generating final response from LLM")
    start_time = time.time()
    chain = prompt_template | root_model | StrOutputParser()
    response = chain.invoke({'query': query, 'context': final_context})
    end_time = time.time()
    logger.info(f"LLM Response Generation Time: {end_time - start_time:.2f}s")
    return response

def chat_with_model(query):
    total_start_time = time.time()
    logger.info(f"Starting chat with model for query: {query}")
    
    # subquery
    start_time = time.time()
    sub_query = process_query_decomposition(query)
    logger.info(f"Decomposed query into sub-queries: {sub_query}")
    logger.info(f"Query Decomposition Time: {time.time() - start_time:.2f}s")
    
    # getting relevant docs using retriver
    start_time = time.time()
    sub_query_docs = process_query_retriever(sub_query) #list of dict {'query', '', 'context', []}
    
    # combining everything
    all_context = []
    for i in sub_query_docs:
        all_context.extend(format_docs(i['context'])) 
    logger.debug(f"Retrieved {len(all_context)} documents before reranking")
    logger.info(f"Retrieval Time: {time.time() - start_time:.2f}s")
    
    start_time = time.time()
    reranked_response = rerank_context(query, [c["text"] for c in all_context])

    # 5. Attach metadata to reranked text
    reranked_chunks = []
    if isinstance(reranked_response, dict) and 'results' in reranked_response:
        for result in reranked_response['results']:
            index = result['index']
            if 0 <= index < len(all_context):
                reranked_chunks.append(all_context[index])
    else:
        # Fallback if something goes wrong
        reranked_chunks = all_context[:5]

    # 6. Create final context
    final_context = "\n\n".join(r["text"] for r in reranked_chunks)
    logger.info("Final context created")
    
    response = final_response(query, final_context)
    print(response) # Keep print for user output, or change to logger if strictly backend
    
    total_end_time = time.time()
    logger.info(f"Chat processing completed. Total Time: {total_end_time - total_start_time:.2f}s")

    # reranking and getting top 5 relevant docs
if __name__ == "__main__":
    chat_with_model("how to load a dataset in machine learning")