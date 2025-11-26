```
User Query
    ↓
Streamlit Chat UI
    ↓
FastAPI /chat endpoint
    ↓
Redis → retrieve previous chat context
    ↓
Retriever Pipeline
    ↓
1. Qdrant Vector Search (top-30)
    ↓
2. Reranker (OpenRouter Voyage Reranker)
    ↓
Top-5 most relevant chunks
    ↓
Prompt Construction (ChatPromptTemplate)
    ↓
LLM (OpenRouter or Fine-Tuned Phi)
    ↓
Response
    ↓
Store chat history in Redis
    ↓
Return to Streamlit UI
```

## RESOURCES

[Advance Rag](https://haystack.deepset.ai/blog/query-expansion)
