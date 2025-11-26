"""Core business logic for RAG model.

This module contains the main components for the RAG system:
- logger: Centralized logging configuration
- embeddings: OpenRouter embeddings integration
- vector_store: Qdrant vector database management
- query_decomposition: Query splitting logic
- retrieval: Document retrieval and reranking
- chat_manager: Main RAG orchestration
- response_prompt: LLM prompting templates
- utils: Utility functions for document processing
"""
