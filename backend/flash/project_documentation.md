# Advanced RAG Project Documentation

## Architecture Overview

This project implements an advanced Retrieval-Augmented Generation (RAG) system designed for high accuracy and comprehensive query answering. The architecture follows a multi-stage pipeline:

1.  **Query Decomposition**: Complex user queries are broken down into smaller, simpler sub-queries using an LLM. This ensures that all aspects of the user's request are addressed.
2.  **Document Retrieval**: We use Qdrant as our vector database. We perform similarity searches for *each* sub-query to retrieve a broad set of potentially relevant documents.
3.  **Flash Reranking**: The retrieved documents are then reranked using `FlashRank`, a lightweight and fast reranking library. This step filters out irrelevant documents and selects the top 3 most pertinent chunks, significantly improving the quality of the context provided to the LLM.
4.  **Multi-LLM Response Generation**: The selected context is fed into multiple LLMs (OpenAI GPT-4o and Google Gemini 1.5 Flash) in parallel. This allows for comparing responses or aggregating insights from different models.

## Key Components

### 1. Vector Database (Qdrant)
-   **Collection**: `docling_praser`
-   **Embedding Model**: `all-MiniLM-L6-v2` (via HuggingFace)
-   **Purpose**: Stores document chunks and metadata (including image paths) for efficient similarity search.

### 2. Query Decomposition (`query_decomposition.py`)
-   **Method**: Uses `ChatOpenAI` (gpt-4o-mini) to split the query.
-   **Benefit**: Handles multi-faceted questions better than a single vector search.

### 3. Retriever & Reranker (`retriever.py`)
-   **Retrieval**: Aggregates results from all sub-queries.
-   **Reranking**: Uses `FlashRank` (default model) to re-score documents based on their relevance to the *original* query.
-   **Benefit**: High recall from sub-queries + High precision from reranking.

### 4. Chat Manager (`chat_manager.py`)
-   **Orchestrator**: Manages the flow from query to response.
-   **Parallel Execution**: Uses LangChain's `RunnableParallel` to get responses from both OpenAI and Google models simultaneously.

## How to Run

1.  **Prerequisites**:
    -   Docker running Qdrant (port 6333).
    -   `.env` file with `OPENAI_API_KEY` and `GOOGLE_API_KEY`.
    -   Python environment with dependencies installed (`pip install -r requirements.txt` + `flashrank`).

2.  **Ingest Data**:
    ```bash
    python backend/flash/qdrant_db.py
    ```

3.  **Run Chat Manager (Test)**:
    ```bash
    python backend/flash/chat_manager.py
    ```

## Design Decisions

-   **Why FlashRank?**: It's extremely fast and runs locally on CPU, avoiding the latency and cost of API-based rerankers (like Cohere) while providing comparable performance for many tasks.
-   **Why Query Decomposition?**: A single embedding often fails to capture the nuance of complex questions. Breaking it down ensures we find evidence for each part of the question.
-   **Why Multi-LLM?**: Provides redundancy and allows the user (or system) to choose the best answer. Gemini Flash is very fast/cheap, while GPT-4o is highly capable.

## Directory Structure
-   `backend/flash/`: Contains all the core logic for this advanced RAG implementation.
    -   `qdrant_db.py`: Ingestion script.
    -   `query_decomposition.py`: Query breakdown logic.
    -   `retriever.py`: Retrieval and reranking logic.
    -   `chat_manager.py`: Main entry point and orchestration.
    -   `config.py`: Configuration settings.
