# RAG Model Performance & Accuracy Improvement Plan

**Project:** DataScience RAG Model  
**Created:** 2025-11-21  
**Status:** Planning Phase

---

## 📋 Overview

This document outlines actionable improvements to enhance both **accuracy** and **response time** of the RAG-based chatbot system. Each item includes priority, estimated impact, and implementation guidance.

---

## 🚀 Performance & Response Time Improvements

### 1. Parallelize Sub-Query Retrieval

- [ ] **Priority:** HIGH | **Impact:** HIGH | **Difficulty:** MEDIUM

**Current Issue:**

- Sequential processing of sub-queries in `filter_context.py`
- If 3 sub-queries each take 1 second, total wait time is 3 seconds

**Implementation Steps:**

1. [ ] Import `concurrent.futures.ThreadPoolExecutor` or use `asyncio`
2. [ ] Refactor `process_query_retriever()` to use parallel execution
3. [ ] Update `retriver.invoke()` calls to run concurrently
4. [ ] Add error handling for failed parallel tasks
5. [ ] Test with multiple sub-queries to verify speedup

**Expected Impact:** 50-70% reduction in retrieval time for queries with multiple sub-queries

**Code Location:** `backend/src/filter_context.py` (lines 19-30)

---

### 2. Optimize Reranking with Local Models

- [ ] **Priority:** MEDIUM | **Impact:** MEDIUM | **Difficulty:** MEDIUM

**Current Issue:**

- External API call to Jina AI adds network latency (~200-500ms)
- Hardcoded API key in code (security risk)

**Implementation Steps:**

1. [ ] **Short Term:**
   - [ ] Move Jina API key to `.env` file
   - [ ] Add error handling and retry logic
   - [ ] Monitor API response times in logs

2. [ ] **Long Term (Optional):**
   - [ ] Evaluate FlashRank or similar lightweight rerankers
   - [ ] Install local reranking model: `pip install flashrank`
   - [ ] Benchmark local vs API performance
   - [ ] Implement fallback to API if local fails

**Expected Impact:** 30-50% reduction in reranking time (if using local model)

**Code Location:** `backend/src/filter_context.py` (lines 32-53)

---

### 3. Asynchronous Embeddings

- [ ] **Priority:** MEDIUM | **Impact:** MEDIUM | **Difficulty:** MEDIUM

**Current Issue:**

- Synchronous `requests` library blocks during embedding generation
- Batch processing is sequential, not concurrent

**Implementation Steps:**

1. [ ] Install async HTTP library: `pip install aiohttp`
2. [ ] Convert `OpenRouterEmbeddings` methods to async
3. [ ] Update `embed_documents()` to use `asyncio.gather()` for batch concurrency
4. [ ] Update caller functions to use `await` or `asyncio.run()`
5. [ ] Add proper exception handling for async operations
6. [ ] Benchmark embedding speed improvements

**Expected Impact:** 40-60% reduction in embedding time for batches

**Code Location:** `backend/src/openrouter_embedding_config.py` (entire class)

---

### 4. Implement Semantic Caching

- [ ] **Priority:** HIGH | **Impact:** HIGH | **Difficulty:** MEDIUM

**Current Issue:**

- Every query runs through the full pipeline, even for similar/repeated questions
- No memory of previous queries

**Implementation Steps:**

1. [ ] **Simple In-Memory Cache (Quick Start):**
   - [ ] Create `cache_manager.py` with dictionary-based cache
   - [ ] Use cosine similarity to match similar queries (threshold: 0.95)
   - [ ] Store query embeddings + responses
   - [ ] Set cache TTL (e.g., 1 hour)

2. [ ] **Production Redis Cache (Recommended):**
   - [ ] Install Redis: `pip install redis`
   - [ ] Set up Redis connection in `.env`
   - [ ] Implement semantic cache with Redis + vector similarity
   - [ ] Add cache hit/miss logging

3. [ ] Integration:
   - [ ] Update `chat_with_model()` to check cache before processing
   - [ ] Cache successful responses after generation
   - [ ] Add cache invalidation mechanism

**Expected Impact:** 90%+ reduction in response time for cached queries

**Code Location:** New file `backend/src/cache_manager.py` + updates to `chat_manager.py`

---

### 5. Optimize Query Decomposition Model

- [ ] **Priority:** MEDIUM | **Impact:** MEDIUM | **Difficulty:** LOW

**Current Issue:**

- Using large `mixtral-8x7b-instruct` model for simple task
- Higher latency and cost than necessary

**Implementation Steps:**

1. [ ] Benchmark current decomposition time
2. [ ] Test with faster models:
   - [ ] `gpt-3.5-turbo`
   - [ ] `meta-llama/llama-3-8b-instruct`
   - [ ] `mistralai/mistral-7b-instruct` (smaller variant)
3. [ ] Compare quality and speed
4. [ ] Update model configuration in `query_decomposition.py`
5. [ ] Re-benchmark after change

**Expected Impact:** 30-40% reduction in decomposition time

**Code Location:** `backend/src/query_decomposition.py` (line 18)

---

## 🎯 Accuracy Improvements

### 6. Implement Hybrid Search (Dense + Sparse)

- [ ] **Priority:** HIGH | **Impact:** HIGH | **Difficulty:** MEDIUM

**Current Issue:**

- Only using dense vector search (semantic)
- Misses exact keyword matches (e.g., specific terms, IDs, names)

**Implementation Steps:**

1. [ ] Enable Qdrant's hybrid search feature
2. [ ] Configure sparse vector index (BM25) in Qdrant collection
3. [ ] Update `qdrant_db.py` collection creation to include sparse vectors
4. [ ] Modify retriever in `filter_context.py` to use hybrid search
5. [ ] Adjust scoring weights (recommended: 0.7 dense, 0.3 sparse)
6. [ ] Test with keyword-heavy queries
7. [ ] Compare results with dense-only search

**Expected Impact:** 15-25% improvement in retrieval accuracy, especially for keyword-specific queries

**Code Location:** `backend/src/qdrant_db.py` (lines 26-49) and `filter_context.py` (lines 10-17)

**Reference:** [Qdrant Hybrid Search Docs](https://qdrant.tech/documentation/concepts/hybrid-queries/)

---

### 7. Improve Query Decomposition Parsing

- [ ] **Priority:** MEDIUM | **Impact:** MEDIUM | **Difficulty:** LOW

**Current Issue:**

- Brittle string parsing using `replace()` methods
- No validation of decomposition output format
- Can fail silently with malformed responses

**Implementation Steps:**

1. [ ] Update prompt to enforce JSON output format
2. [ ] Add JSON schema validation to prompt
3. [ ] Replace `process_output()` string manipulation with proper JSON parsing
4. [ ] Add try-except with fallback to original query if parsing fails
5. [ ] Log decomposition failures for monitoring
6. [ ] Test with edge cases (single query, complex multi-part queries)

**Expected Impact:** More reliable sub-query generation, fewer edge case failures

**Code Location:** `backend/src/query_decomposition.py` (lines 88-99)

---

### 8. Enhance Retrieval with MMR Tuning

- [ ] **Priority:** LOW | **Impact:** LOW-MEDIUM | **Difficulty:** LOW

**Current Issue:**

- MMR parameters (`lambda_mult=0.5`) may not be optimal for your dataset
- Fixed `k=5` might not be ideal for all queries

**Implementation Steps:**

1. [ ] Create evaluation dataset with sample queries
2. [ ] Benchmark current retrieval quality (precision/recall)
3. [ ] Experiment with different MMR parameters:
   - [ ] `lambda_mult`: Try 0.3, 0.5, 0.7 (0.5 = balanced, lower = more diverse)
   - [ ] `k`: Try 3, 5, 7, 10
   - [ ] `fetch_k`: Try 15, 20, 30
4. [ ] Measure improvement with evaluation metrics
5. [ ] Update configuration with optimal values
6. [ ] Consider making parameters query-dependent

**Expected Impact:** 5-10% improvement in context relevance

**Code Location:** `backend/src/filter_context.py` (lines 10-17)

---

## 🛠️ Code Quality & Infrastructure

### 9. Fix Response Schema & Metrics Tracking

- [ ] **Priority:** HIGH | **Impact:** MEDIUM | **Difficulty:** LOW

**Current Issue:**

- `ChatResponse` model defined but not used
- No structured response with metrics
- Frontend cannot display performance data

**Implementation Steps:**

1. [ ] Update `chat_with_model()` to return structured dict with:
   - [ ] `query`: Original user query
   - [ ] `response`: LLM answer
   - [ ] `context`: Retrieved context (optional)
   - [ ] `sources`: Source metadata
   - [ ] `response_time`: Total processing time
   - [ ] `metrics`: Dict with decomposition_time, retrieval_time, rerank_time, llm_time
   - [ ] `sub_queries`: Decomposed queries (for debugging)
2. [ ] Update `main.py` endpoint to use `ChatResponse` model
3. [ ] Add token counting if available from LLM API
4. [ ] Test endpoint returns valid JSON structure
5. [ ] Update frontend to display new metrics

**Expected Impact:** Better observability, user transparency, debugging capability

**Code Location:**

- `backend/core/main.py` (lines 6-25)
- `backend/src/chat_manager.py` (lines 51-95)

---

### 10. Add Comprehensive Error Handling

- [ ] **Priority:** MEDIUM | **Impact:** MEDIUM | **Difficulty:** LOW

**Implementation Steps:**

1. [ ] Add try-except blocks in all API calls
2. [ ] Implement graceful degradation:
   - [ ] If decomposition fails → use original query
   - [ ] If reranking fails → use retrieval results without reranking
   - [ ] If LLM fails → return error message with context
3. [ ] Add request timeouts to prevent hanging
4. [ ] Log all errors with context
5. [ ] Create custom exception classes for better debugging

**Code Location:** All files in `backend/src/`

---

### 11. Add Performance Monitoring Dashboard

- [ ] **Priority:** LOW | **Impact:** LOW | **Difficulty:** MEDIUM

**Implementation Steps:**

1. [ ] Set up Prometheus metrics export
2. [ ] Track key metrics:
   - [ ] Average response time
   - [ ] Cache hit rate
   - [ ] Retrieval latency
   - [ ] LLM latency
   - [ ] Error rates
3. [ ] Create Grafana dashboard (or simple logging dashboard)
4. [ ] Set up alerts for degraded performance

**Code Location:** New file `backend/src/metrics.py`

---

## 📊 Testing & Validation

### 12. Create Evaluation Suite

- [ ] **Priority:** MEDIUM | **Impact:** HIGH | **Difficulty:** MEDIUM

**Implementation Steps:**

1. [ ] Create test dataset with:
   - [ ] 20-30 representative questions
   - [ ] Ground truth answers
   - [ ] Expected sources
2. [ ] Implement evaluation metrics:
   - [ ] Answer accuracy (manual or LLM-as-judge)
   - [ ] Context relevance score
   - [ ] Response time
   - [ ] Source attribution accuracy
3. [ ] Create baseline benchmark before changes
4. [ ] Re-run after each improvement
5. [ ] Document improvements in spreadsheet

**Code Location:** New file `backend/tests/evaluation_suite.py`

---

## 🎯 Implementation Roadmap

### Phase 1: Quick Wins (Week 1)

1. Fix Response Schema (#9)
2. Implement Semantic Caching (#4)
3. Optimize Query Decomposition Model (#5)

**Expected Outcome:** 40-60% improvement in average response time

---

### Phase 2: Core Improvements (Week 2)

1. Parallelize Sub-Query Retrieval (#1)
2. Implement Hybrid Search (#6)
3. Improve Query Decomposition Parsing (#7)

**Expected Outcome:** 20-30% improvement in accuracy, additional 30% speed improvement

---

### Phase 3: Advanced Optimizations (Week 3)

1. Asynchronous Embeddings (#3)
2. Optimize Reranking (#2)
3. Add Comprehensive Error Handling (#10)

**Expected Outcome:** Production-ready system with robust error handling

---

### Phase 4: Monitoring & Iteration (Week 4)

1. Create Evaluation Suite (#12)
2. Add Performance Monitoring (#11)
3. Tune MMR Parameters (#8)

**Expected Outcome:** Data-driven optimization and continuous improvement

---

## 📈 Success Metrics

Track these KPIs before and after implementation:

- [ ] **Average Response Time:** Target < 2 seconds (currently ~4-6 seconds)
- [ ] **Cache Hit Rate:** Target > 30% for production traffic
- [ ] **Answer Accuracy:** Target > 85% on evaluation set
- [ ] **P95 Response Time:** Target < 5 seconds
- [ ] **Error Rate:** Target < 1%

---

## 📝 Notes & Decisions

### Decision Log

- **2025-11-21:** Initial improvement plan created
- Add decisions and findings here as you implement...

### Blockers

- None currently

### Questions

- Add any questions or clarifications needed during implementation

---

## ✅ Completion Tracking

**Overall Progress:** 0/12 items completed

**By Priority:**

- HIGH Priority: 0/4 completed
- MEDIUM Priority: 0/6 completed  
- LOW Priority: 0/2 completed

**By Category:**

- Performance: 0/5 completed
- Accuracy: 0/3 completed
- Code Quality: 0/4 completed

---

**Last Updated:** 2025-11-21  
**Next Review:** After Phase 1 completion
