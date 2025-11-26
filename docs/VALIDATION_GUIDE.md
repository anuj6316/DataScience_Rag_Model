# DataScience RAG Model - Validation Guide

## Overview

This project now includes a comprehensive validation system that tests all aspects of the RAG model, from basic code quality to complete end-to-end user workflows.

## Quick Start

### Run Basic Validation

For a quick validation of critical components:

```bash
./validate.sh
```

This runs:
- Environment configuration checks
- Code linting
- Type checking
- Import validation
- Component unit tests
- Integration tests
- Security checks

**Estimated time:** 2-3 minutes

### Run Full Validation

For comprehensive validation including E2E workflows, performance benchmarks, and Docker validation:

See the complete validation documentation in:
```
.claude/commands/validate.md
```

## What Gets Validated

### Phase 1: Environment Setup
- ✅ `.env` file exists
- ✅ All required API keys present
- ✅ Configuration valid

### Phase 2: Code Quality
- ✅ Python linting (flake8)
- ✅ Code style consistency
- ✅ No obvious syntax errors

### Phase 3: Type Checking
- ✅ Type annotations (mypy)
- ✅ Type consistency

### Phase 4: Import Validation
- ✅ All modules can be imported
- ✅ No circular dependencies
- ✅ All dependencies installed

### Phase 5: Component Tests
- ✅ Logger functionality
- ✅ OpenRouter embeddings (API call)
- ✅ Document loading and splitting
- ✅ Qdrant connection and collection
- ✅ Query decomposition (LLM call)

### Phase 6: Integration Tests
- ✅ Full retrieval pipeline (decomposition → retrieval → reranking)
- ✅ FastAPI app initialization
- ✅ Component interactions

### Phase 7: Security
- ✅ No hardcoded API keys in code
- ✅ `.gitignore` configured properly
- ✅ Sensitive data handling

### Additional Phases (in full validation)
- 📊 Performance benchmarks
- 🔄 End-to-end user workflows
- 🐳 Docker build and container tests
- 📁 Data integrity checks
- 📝 Logging system validation

## Prerequisites

Before running validation:

1. **Environment file configured:**
   ```bash
   # Required in .env:
   OPENROUTER_API_KEY=your_key
   GOOGLE_API_KEY=your_key
   QDRANT_URL=your_url
   QDRANT_API_KEY=your_key
   QDRANT_COLLECTION_NAME=your_collection
   EMBEDDING_MODEL_NAME=qwen/qwen3-embedding-8b
   ```

2. **Dependencies installed:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Qdrant accessible:**
   - Local: Running on `http://localhost:6333`
   - Remote: Configured in `.env`

4. **Data files (optional for basic tests):**
   - PDF, DOCX, or TXT files in `./data/` directory
   - Required for document ingestion tests

## Running Specific Test Phases

You can run individual phases by extracting commands from `.claude/commands/validate.md`:

### Example: Test only embeddings
```bash
python3 << 'EOF'
from backend.src.openrouter_embedding_config import OpenRouterEmbeddings
from dotenv import load_dotenv
load_dotenv()

embeddings = OpenRouterEmbeddings()
result = embeddings.embed_query("Test query")
print(f"✅ Embedding successful: {len(result)} dimensions")
EOF
```

### Example: Test only query pipeline
```bash
python3 << 'EOF'
from backend.src.query_decomposition import process_query_decomposition
sub_queries = process_query_decomposition("What is machine learning?")
print(f"✅ Decomposed into {len(sub_queries)} sub-queries")
EOF
```

## Understanding Results

### Success Indicators
- `✅` Green checkmarks = Tests passed
- Summary shows all phases completed

### Warnings
- `⚠️` Yellow warnings = Non-critical issues
- Examples:
  - Vector store empty (normal for first run)
  - Slow response times (may need optimization)
  - Linting suggestions (not breaking)

### Errors
- `❌` Red X marks = Critical failures
- Script exits with error code
- Check error messages for details

## Common Issues

### "No module named 'backend'"
**Solution:** Ensure you're running from project root
```bash
cd /home/anuj/DataScience_Rag_Model
./validate.sh
```

### "OPENROUTER_API_KEY is required"
**Solution:** Check your `.env` file exists and has the key
```bash
cat .env | grep OPENROUTER_API_KEY
```

### "Qdrant connection failed"
**Solution:** 
- Check Qdrant is running: `docker ps` (if using Docker)
- Verify `QDRANT_URL` in `.env`
- Test connection: `curl http://localhost:6333/collections`

### "Collection does not exist"
**Solution:** This is normal for first run. To populate:
```bash
python3 -m backend.src.qdrant_db
```

### API Rate Limits
**Solution:** Tests make real API calls. If you hit rate limits:
- Wait a few minutes
- Use smaller test batches
- Check your API quotas

## Performance Benchmarks

Expected performance (based on your setup):

| Operation           | Expected Time | Warning Threshold |
| ------------------- | ------------- | ----------------- |
| Single embedding    | 0.5-1.5s      | > 2s              |
| Query decomposition | 2-4s          | > 5s              |
| Retrieval (5 docs)  | 0.5-1s        | > 2s              |
| Reranking           | 0.3-0.8s      | > 1s              |
| Full E2E query      | 4-8s          | > 15s             |

## CI/CD Integration

To use in CI/CD pipelines:

```yaml
# .github/workflows/validate.yml
name: Validate RAG Model

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.12'
      - name: Install dependencies
        run: pip install -r requirements.txt
      - name: Run validation
        env:
          OPENROUTER_API_KEY: ${{ secrets.OPENROUTER_API_KEY }}
          GOOGLE_API_KEY: ${{ secrets.GOOGLE_API_KEY }}
        run: ./validate.sh
```

## Extending Validation

To add new tests:

1. **Add to `validate.sh`** for quick tests
2. **Add to `.claude/commands/validate.md`** for comprehensive tests
3. Follow the existing phase structure
4. Use clear success/failure indicators

Example template:
```bash
echo "Testing [component name]..."
python3 << 'EOF'
# Your test code
try:
    # Test logic
    print("✅ Test passed")
except Exception as e:
    print(f"❌ Test failed: {e}")
    exit(1)
EOF
```

## Validation in Development Workflow

Recommended workflow:

1. **Before committing:**
   ```bash
   ./validate.sh
   ```

2. **Before deployment:**
   ```bash
   # Run full validation from .claude/commands/validate.md
   # Including Docker and E2E tests
   ```

3. **After major changes:**
   ```bash
   # Run performance benchmarks
   # Check for regressions
   ```

## Support

If validation fails unexpectedly:

1. Check error messages carefully
2. Verify prerequisites (API keys, Qdrant, data)
3. Run individual test phases to isolate issue
4. Check logs in `./logs/` directory
5. Review `.env` configuration

## Files

- `validate.sh` - Quick validation script (critical tests)
- `.claude/commands/validate.md` - Full validation documentation
- `backend/src/logger.py` - Logging configuration
- `.env` - Configuration (not in git)
- `logs/` - Log output directory

---

**Last Updated:** 2025-11-21  
**Version:** 1.0.0
