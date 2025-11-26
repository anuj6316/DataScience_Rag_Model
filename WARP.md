# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Common Commands

### Python backend

Environment & dependencies:
- Create venv and install deps:
  - `python3 -m venv venv`
  - `source venv/bin/activate`
  - `pip install -r requirements.txt`

Run the API (FastAPI, backed by the `backend.flash` pipeline):
- `uvicorn backend.core.main:app --reload --host 0.0.0.0 --port 8000`

Ingest documents into Qdrant ("legacy" src pipeline, reads from `data/`):
- Place PDFs/DOCX/TXT/CSV/MD under `data/`
- `python3 -m backend.src.vector_store`

Run the comprehensive validation suite (lint, type-check, imports, component tests, integration/E2E, security, Docker, API checks):
- `bash scripts/validate.sh`
- For phase-by-phase validation commands and a quicker subset, see `.claude/commands/validate.md`.

Linting / formatting / type checking (run from repo root):
- Format (if you want auto-formatting):
  - `black backend/`
- Lint:
  - `flake8 backend/src backend/flash backend/core`
- Type check:
  - `mypy backend/src backend/flash`

Testing:
- Pytest test suite (once tests exist under `tests/` as described in `README.md`):
  - `pytest tests/`
- Example of running a single pytest test:
  - `pytest tests/test_some_module.py::test_specific_behavior`

Docker build & run:
- Build image: `docker build -t datascience-rag .`
- Run container: `docker run -p 8000:8000 --env-file .env datascience-rag`

### Frontend (`beebot-ai/`)

From `beebot-ai/`:
- Install deps: `npm install`
- Run dev server: `npm run dev`
- Build production bundle: `npm run build`
- Preview built app: `npm run preview`

Ensure `GEMINI_API_KEY` is set in `beebot-ai/.env.local` when running the frontend.

## Architecture Overview

### High-level layout

- `backend/core/main.py`: FastAPI application exposing HTTP and WebSocket endpoints and delegating queries into the newer `backend.flash` RAG pipeline.
- `backend/flash/`: Newer, async-first RAG implementation optimized for Gemini via OpenRouter, FlashRank reranking, and a Qdrant-backed vector store.
- `backend/src/`: Original RAG pipeline built directly on LangChain, Qdrant, Jina AI reranking, OpenRouter embeddings, and Google Gemini. Still used by some validation and E2E flows.
- `data/`: Knowledge base documents (for the `backend.src` ingestion pipeline) and JSONL knowledge base used by the `backend.flash` pipeline.
- `scripts/`: Utility and validation scripts, including `validate.sh` which orchestrates multi-phase validation.
- `docs/`: Project documentation (architecture, validation workflow, improvement plan, etc.).
- `beebot-ai/`: Vite + React frontend that talks to the backend API.

### API layer (`backend/core`)

- `backend/core/main.py` creates the FastAPI app, configures permissive CORS (intended to be tightened in production), and exposes:
  - `GET /` – root metadata endpoint (status, version, and pointers to main endpoints).
  - `GET /health` – simple health check.
  - `GET /chat_response` – HTTP GET chat endpoint (used for simple tests and backwards compatibility).
  - `POST /chat` – HTTP POST chat endpoint using a `ChatRequest` body.
  - `WS /ws/chat` – WebSocket endpoint for real-time chat.
- All chat endpoints delegate to `backend.flash.chat_manager.process_query`, so the **flash pipeline is the source of truth** for production chat behavior.

### Flash RAG pipeline (`backend/flash`)

- Orchestration: `backend/flash/chat_manager.py`
  - Loads environment from the project `.env` and initializes two OpenRouter-backed Gemini models (`google/gemini-2.0-flash-001`) via `langchain_openai.ChatOpenAI`.
  - `process_query(query: str)` is the main async entrypoint used by the FastAPI app.
  - Pipeline steps:
    1. **Decomposition** – `backend.flash.query_decomposition.decompose_query` turns the user query into several sub-queries using Gemini via OpenRouter.
    2. **Retrieval** – `backend.flash.retriever.retrieve_documents` does similarity search against a Qdrant collection (`docling_praser`) via `langchain_qdrant.QdrantVectorStore`, deduplicating by `page_content`.
    3. **Reranking** – `backend.flash.retriever.rerank_documents` uses `flashrank.Ranker` to rerank retrieved documents by relevance.
    4. **Context assembly** – top documents’ `page_content` are concatenated into a single context string; any `diagram_images` metadata is collected for the response.
    5. **Multi-LLM answer generation** – a shared `ChatPromptTemplate` feeds the context and query into two Gemini-based chains in parallel ("flash" and "pro"; currently the same underlying model). The primary `response` field in the API output uses the "flash" variant.
  - Returns a rich result dict with `query`, `response`, `responses` (per-LLM), `context`, `sub_queries`, `diagram_images`, `metrics` (timings), and `response_time`.

- Configuration & vector store:
  - `backend/flash/config.py` defines the Hugging Face embedding model (`all-MiniLM-L6-v2`), its dimension, and Qdrant host/port used by `backend.flash.retriever`.
  - `backend/flash/qdrant_db.py` is a one-off ingestion script that:
    - Reads `data/knowledge_base_stream_processed.jsonl` produced by upstream preprocessing (e.g. docling).
    - Splits text into chunks via `MarkdownTextSplitter`.
    - Wraps chunks into `langchain_core.documents.Document` objects with metadata (file path, page number, diagram images, etc.).
    - Creates/replaces the `docling_praser` collection in Qdrant and ingests the chunks using the configured embedding function.

- Logging:
  - `backend/flash/logger_config.py` defines a centralized logger that logs to both stdout and `logs/app.log`. The FastAPI app imports and uses this logger for API and WebSocket events.

### Legacy RAG pipeline (`backend/src`)

This pipeline is still heavily used by scripts and validation but is not wired into the FastAPI endpoints.

- Orchestration: `backend/src/chat_manager.py`
  - Uses OpenRouter-based embeddings (`OpenRouterEmbeddings`), query decomposition, retrieval, and Jina AI reranking to build a final context, then sends it to Google Gemini via `langchain_google_genai.GoogleGenerativeAI`.
  - `chat_with_model(query)` is the main synchronous entrypoint used in E2E tests (e.g. from `.claude/commands/validate.md`).

- Embeddings & vector store:
  - `backend/src/embeddings.py` implements `OpenRouterEmbeddings`, a custom `langchain.embeddings.base.Embeddings` subclass that calls the OpenRouter embeddings API:
    - Reads `OPENROUTER_API_KEY`, `EMBEDDING_MODEL_NAME`, and optionally `EMBEDDING_URL` from `.env`.
    - Supports batched document embedding and single-query embeddings with logging and basic error handling.
  - `backend/src/vector_store.py`:
    - Initializes a `qdrant_client.QdrantClient` (URL from `QDRANT_URL` in `.env`, or currently hardcoded to `http://localhost:6333` in this version).
    - Ensures the target collection (`QDRANT_COLLECTION_NAME`) exists with the expected 4096-dim vector size.
    - Wraps the client and `OpenRouterEmbeddings` into a `langchain_qdrant.QdrantVectorStore` (`VECTORSTORE`).
    - Provides `process_vectorstore()` which:
      - Calls `backend.src.utils.load_docs` to load docs from `data/`.
      - Splits them into chunks via `backend.src.utils.split_docs`.
      - Generates deterministic UUIDv5 IDs per chunk to deduplicate content and only add new chunks.
      - Adds new chunks to Qdrant in batches with logging and progress via `tqdm`.

- Retrieval & reranking:
  - `backend/src/retrieval.py` defines a LangChain retriever from `VECTORSTORE` with MMR search (configurable `k`, `fetch_k`, `lambda_mult`).
  - `process_query_retriever` retrieves documents per sub-query; `rerank_context` sends the query and candidate texts to the Jina AI rerank API (`JINA_API_KEY` from `.env`) and returns the top-5 documents.

- Query decomposition:
  - `backend/src/query_decomposition.py` uses `langchain_openai.ChatOpenAI` configured against OpenRouter (model `mistralai/mixtral-8x7b-instruct`) to decompose the original user query into sub-queries.

- Utilities & logging:
  - `backend/src/utils.py`:
    - Hardcodes `KNOWLEDGE_BASE_DIR` to `/home/anuj/DataScience_Rag_Model/data` and loads various file types (`pdf`, `docx`, `txt`, `csv`, `xlsx`, `md`) using `DirectoryLoader` variants.
    - Splits docs into chunks via `RecursiveCharacterTextSplitter` with configurable `CHUNK_SIZE` and `CHUNK_OVERLAP`.
    - Provides `format_docs` to convert LangChain documents into `{text, meta}` dicts used for reranking and final context.
  - `backend/src/logger.py` configures per-module loggers writing both to stdout and a rotating log file under `logs/app.log`.

When updating RAG behavior, be explicit about whether the change belongs in the **flash** pipeline, the **legacy src** pipeline, or both; a lot of validation and documentation still reference the src-based flow even though production traffic goes through `backend.flash`.

### Validation & diagnostics

- `scripts/validate.sh` is the main entrypoint for a multi-phase validation run. It:
  - Checks `.env` and required environment variables.
  - Runs flake8 on `backend/src`, `backend/flash`, and `backend/core`.
  - Runs mypy on `backend/src` and `backend/flash`.
  - Imports all major backend modules to catch syntax/import errors.
  - Exercises key components (loggers, embeddings, Qdrant connectivity, query decomposition, retrieval pipeline, FastAPI app, async `process_query`).
  - Performs simple security scans for obvious hardcoded secrets.
- `.claude/commands/validate.md` mirrors and extends this, describing individual phases (including Docker build/run, API endpoint tests including WebSocket, performance benchmarks, data integrity checks, and logging validation). Treat it as the authoritative reference for what “full validation” should cover.

If you modify imports, module names, or FastAPI route behavior, check whether `scripts/validate.sh` and `.claude/commands/validate.md` need to be updated to keep validation green.

### Frontend (`beebot-ai/`)

- `beebot-ai/` is a standalone Vite + React app (see its `package.json` and `README.md`) that provides a UI for the RAG backend.
- It relies on `GEMINI_API_KEY` configured in `.env.local` and communicates with the backend over HTTP/WebSocket (the exact wiring lives in the React code).
- Backend and frontend can be iterated on independently; be mindful of CORS settings in `backend/core/main.py` if you change frontend origin or deployment setup.
