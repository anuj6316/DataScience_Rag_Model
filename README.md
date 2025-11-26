# DataScience RAG Model 🤖📚

A production-ready **Retrieval-Augmented Generation (RAG)** chatbot specialized in Data Science queries. Built with FastAPI, Qdrant, and Google Gemini, featuring advanced query decomposition and semantic reranking.

## ✨ Features

- 🔍 **Advanced Query Decomposition** - Automatically splits complex queries into sub-queries using Mixtral-8x7b
- 📊 **Semantic Vector Search** - Powered by Qdrant with MMR (Maximum Marginal Relevance)
- 🎯 **Intelligent Reranking** - Jina AI reranker for precise context selection
- 🚀 **High-Performance Embeddings** - OpenRouter Qwen 8B embeddings (4096 dimensions)
- 💬 **Smart Response Generation** - Google Gemini 2.5 Flash for accurate answers
- 📝 **Comprehensive Logging** - Detailed logging with response time tracking
- 🔄 **Document Deduplication** - Hash-based deduplication for efficient storage
- 🐳 **Docker Support** - Ready for containerized deployment

## 🏗️ Architecture

```
User Query → Query Decomposition → Vector Search (Qdrant) → 
Reranking (Jina) → Context + Prompt → LLM (Gemini) → Response
```

### Tech Stack

- **Backend Framework**: FastAPI
- **Vector Database**: Qdrant Cloud
- **Embeddings**: OpenRouter (Qwen 8B, 4096-dim)
- **LLM**: Google Gemini 2.5 Flash
- **Reranker**: Jina AI
- **Language**: Python 3.12

## 📁 Project Structure

```
DataScience_Rag_Model/
├── backend/                    # Backend application
│   ├── core/
│   │   └── main.py            # FastAPI app entry point
│   └── src/
│       ├── logger.py          # Logging configuration
│       ├── embeddings.py      # Embedding model integration
│       ├── vector_store.py    # Qdrant vector database
│       ├── query_decomposition.py  # Query splitting logic
│       ├── retrieval.py       # Retrieval & reranking
│       ├── chat_manager.py    # Main RAG orchestration
│       ├── response_prompt.py # LLM prompting
│       └── utils.py           # Document utilities
├── data/                      # Knowledge base documents (PDFs, DOCX)
├── docs/                      # Documentation
│   ├── VALIDATION_GUIDE.md   # Validation instructions
│   ├── IMPROVEMENT_PLAN.md   # Future improvements
│   └── notes.md              # Development notes
├── scripts/                   # Utility scripts
│   └── validate.sh           # Validation script
├── notebooks/                 # Jupyter notebooks
│   └── training.ipynb        # Training experiments
├── logs/                      # Application logs
├── tests/                     # Test suite (future)
├── requirements.txt           # Python dependencies
├── .env                       # Environment variables
└── dockerfile                 # Docker configuration
```

## 🚀 Quick Start

### Prerequisites

- Python 3.12+
- API Keys:
  - OpenRouter API key
  - Google AI API key
  - Qdrant Cloud API key & URL
  - Jina AI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/anuj6316/DataScience_Rag_Model.git
   cd DataScience_Rag_Model
   ```

2. **Create virtual environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```bash
   # OpenRouter Embeddings
   OPENROUTER_API_KEY=your_openrouter_key
   EMBEDDING_MODEL_NAME=qwen/qwen3-embedding-8b
   
   # Google Gemini LLM
   GOOGLE_API_KEY=your_google_ai_key
   
   # Qdrant Vector Database
   QDRANT_URL=your_qdrant_url
   QDRANT_API_KEY=your_qdrant_key
   QDRANT_COLLECTION_NAME=datascience_collections
   
   # Jina AI Reranker
   JINA_API_KEY=your_jina_key
   ```

5. **Ingest documents into Qdrant**
   
   Place your documents in the `data/` directory, then run:
   ```bash
   python3 -m backend.src.vector_store
   ```

6. **Run the application**
   ```bash
   uvicorn backend.core.main:app --reload --host 0.0.0.0 --port 8000
   ```

7. **Access the API**
   - API: http://localhost:8000
   - Docs: http://localhost:8000/docs
   - Query: http://localhost:8000/chat_response?query=What%20is%20machine%20learning?

## 📖 API Endpoints

### GET `/`
Health check endpoint
```bash
curl http://localhost:8000/
```

### GET `/chat_response`
Chat with the RAG model
```bash
curl "http://localhost:8000/chat_response?query=What is machine learning?"
```

**Response:**
```json
{
  "query": "What is machine learning?",
  "response": "Machine learning is a subset of artificial intelligence...",
  "processing_time": "8.2s"
}
```

## 🐳 Docker Deployment

1. **Build the image**
   ```bash
   docker build -t datascience-rag .
   ```

2. **Run the container**
   ```bash
   docker run -p 8000:8000 --env-file .env datascience-rag
   ```

## ✅ Validation

Run the comprehensive validation suite:

```bash
# Quick validation (Phases 1-7)
bash scripts/validate.sh

# For detailed validation instructions
cat docs/VALIDATION_GUIDE.md
```

**What gets validated:**
- ✅ Environment configuration
- ✅ Code quality (linting, type checking)
- ✅ Module imports
- ✅ Component functionality
- ✅ Integration tests
- ✅ End-to-end workflows
- ✅ Security (no hardcoded secrets)

## 🔧 Development

### Adding New Documents

1. Place files in `data/` directory (PDF, DOCX, TXT, CSV, MD supported)
2. Run ingestion:
   ```bash
   python3 -m backend.src.vector_store
   ```

### Running Tests

```bash
pytest tests/
```

### Code Formatting

```bash
# Auto-format with black
black backend/

# Lint with flake8
flake8 backend/

# Type check with mypy
mypy backend/
```

## 📊 Performance

| Operation           | Average Time |
| ------------------- | ------------ |
| Query Decomposition | ~3-4s        |
| Vector Retrieval    | <1s          |
| Reranking           | <1s          |
| LLM Response        | ~2-3s        |
| **Total E2E**       | **~8s**      |

## 🛠️ Configuration

### Adjusting Retrieval Settings

Edit `backend/src/retrieval.py`:
```python
retriever = VECTORSTORE.as_retriever(
    search_type="mmr",
    search_kwargs={
        "k": 20,              # Top-K documents
        "fetch_k": 50,        # Candidates for MMR
        "lambda_mult": 0.7    # Diversity vs relevance
    }
)
```

### Adjusting Reranking

Edit `backend/src/retrieval.py`:
```python
data = {
    "model": "jina-reranker-v3",
    "top_n": 5,  # Number of documents to keep
    ...
}
```

## 📚 Documentation

- [Validation Guide](docs/VALIDATION_GUIDE.md) - How to validate the project
- [Improvement Plan](docs/IMPROVEMENT_PLAN.md) - Planned enhancements
- [Validation Workflow](docs/validation_workflow.md) - Detailed validation steps
- [Implementation Notes](docs/implementation.md) - Technical details

## 🔄 RAG Pipeline Details

### 1. Query Decomposition
Uses Mixtral-8x7b to split complex queries into independent sub-queries for better retrieval accuracy.

### 2. Vector Retrieval
- Retrieves top-20 documents using MMR search
- 4096-dimensional embeddings from Qwen 8B
- Deduplication using deterministic hashing

### 3. Reranking
- Jina AI reranker selects top-5 most relevant documents
- Cross-encoder architecture for accurate scoring

### 4. Response Generation
- Google Gemini 2.5 Flash generates final response
- Structured prompting with retrieved context
- Real-time response streaming

## 🔐 Security

- ✅ All API keys stored in `.env` (never committed)
- ✅ No hardcoded secrets in source code
- ✅ `.gitignore` configured properly
- ✅ Environment validation before runtime

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👤 Author

**Anuj Kumar**
- GitHub: [@anuj6316](https://github.com/anuj6316)

## 🙏 Acknowledgments

- LangChain for RAG framework
- Qdrant for vector database
- OpenRouter for embeddings API
- Google for Gemini LLM
- Jina AI for reranking

## 📮 Support

For issues and questions:
- Open an issue on GitHub
- Check [docs/VALIDATION_GUIDE.md](docs/VALIDATION_GUIDE.md) for common problems

---

**Made with ❤️ for the Data Science community**

## Bug Fixes

### Backend
- [ ] All images are getting displayed in the response(only relevant images needs to be in the response with detailed explanation).
- [ ] Mapping of documents are not getting mapped right.

### Frontend
- [ ] Automatically get to the bottom of the page whenever it's loaded.

## Future Improvements

### Backend
- [ ] Add the function to upload documents to Qdrant with validation for duplicate documents
- [ ] add the functionality to create mindmap of the documents.
- [ ] Integrate the postgres with my database.

### Frontend
- [ ] Create a engaging Hero section UI.
- [ ] Add the toggle button for light and dark mode.
- [ ] Enable the mic button to get the audio input from the user.