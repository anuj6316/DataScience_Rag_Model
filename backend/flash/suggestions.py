import os
from typing import List
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from backend.flash.logger_config import logger

# Initialize LLM for suggestions
# Using a fast model for quick suggestion generation
llm = ChatOpenAI(
    model="openai/gpt-oss-safeguard-20b", # Using the same fast model as decomposition
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
)

def generate_suggestions(query: str, context: str = "") -> List[str]:
    """
    Generates a list of 3 brief, relevant follow-up questions based on the user query and context.
    """
    try:
        template = """You are a helpful assistant. Based on the user's query and the provided context (if any), suggest 3 brief, relevant follow-up questions that the user might want to ask next.

        Original Query: {query}
        Context Summary: {context}

        Return ONLY the 3 questions, one per line. Do not number them. Keep them short and concise.
        """

        prompt = ChatPromptTemplate.from_template(template)
        chain = prompt | llm | StrOutputParser()

        # Truncate context to avoid huge prompts if it's too long
        truncated_context = context[:1000] + "..." if len(context) > 1000 else context

        response = chain.invoke({"query": query, "context": truncated_context})
        suggestions = [line.strip() for line in response.split("\n") if line.strip()]
        
        # Ensure we have at most 3
        return suggestions[:3]

    except Exception as e:
        logger.error(f"Error generating suggestions: {e}")
        return []
