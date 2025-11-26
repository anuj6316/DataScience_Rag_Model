import os
import time
from typing import List

from dotenv import load_dotenv
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

from backend.flash.logger_config import logger

# Load .env from project root
dotenv_path = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"
)
load_dotenv(dotenv_path)

# Initialize LLM for decomposition using OpenRouter
# User requested gemini-2.5-flash, mapping to google/gemini-2.0-flash-001 as 2.5 is likely not available on OpenRouter yet or is 2.0
# Using google/gemini-2.0-flash-001 which is the current latest flash on OpenRouter
llm = ChatOpenAI(
    model="openai/gpt-oss-safeguard-20b",
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
)


def decompose_query(query: str) -> List[str]:
    """
    Decomposes a complex query into a list of simple sub-queries.
    """
    start_time = time.time()
    logger.info(f"Starting query decomposition for: {query}")

    template = """You are a helpful assistant that decomposes complex queries into simple, independent sub-queries for retrieval.

    Original Query: {query}

    Provide a list of 3-5 sub-queries that cover different aspects of the original query.
    Return ONLY the sub-queries, one per line. Do not number them.
    """

    prompt = ChatPromptTemplate.from_template(template)
    chain = prompt | llm | StrOutputParser()

    try:
        response = chain.invoke({"query": query})
        sub_queries = [line.strip() for line in response.split("\n") if line.strip()]

        # Always include the original query
        if query not in sub_queries:
            sub_queries.append(query)

        logger.info(
            f"Decomposition completed in {time.time() - start_time:.2f}s. Generated {len(sub_queries)} sub-queries.\n{sub_queries}"
        )
        return sub_queries

    except Exception as e:
        logger.error(f"Error during query decomposition: {e}")
        # Fallback to original query
        return [query]
