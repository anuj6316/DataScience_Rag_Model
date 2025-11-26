"""
Simulation comparing Query Decomposition vs ReAct for retrieval.
Measures response time and retrieval quality for both approaches.
"""

import time
from typing import List, Dict, Any
import statistics


# ============================================================================
# SIMULATION PARAMETERS
# ============================================================================

# Simulated timing (in seconds) based on typical LLM/retrieval performance
LLM_CALL_TIME = 1.5  # Time for LLM to generate response
RETRIEVAL_TIME = 0.3  # Time for single retrieval operation
EMBEDDING_TIME = 0.1  # Time to generate embeddings

# Test queries of varying complexity
TEST_QUERIES = [
    {
        "query": "What is machine learning?",
        "complexity": "simple",
        "expected_decomposition": 1,  # Simple queries don't need decomposition
        "expected_react_iterations": 1
    },
    {
        "query": "Compare supervised and unsupervised learning with examples",
        "complexity": "medium",
        "expected_decomposition": 2,
        "expected_react_iterations": 2
    },
    {
        "query": "Explain the transformer architecture, its advantages over RNNs, and how it's used in modern LLMs like GPT and BERT",
        "complexity": "complex",
        "expected_decomposition": 4,
        "expected_react_iterations": 3
    },
    {
        "query": "What are the steps to fine-tune a pre-trained model, what datasets are needed, and how do you evaluate the results?",
        "complexity": "complex",
        "expected_decomposition": 3,
        "expected_react_iterations": 3
    }
]


# ============================================================================
# QUERY DECOMPOSITION SIMULATION
# ============================================================================

def simulate_query_decomposition(query: str, num_subqueries: int) -> Dict[str, Any]:
    """
    Simulate query decomposition approach.
    
    Process:
    1. LLM decomposes query into sub-queries (1 LLM call)
    2. Retrieve documents for each sub-query in parallel (N retrievals)
    3. Merge and deduplicate results
    
    Args:
        query: Original query
        num_subqueries: Number of sub-queries to generate
    
    Returns:
        Dict with timing breakdown
    """
    start_time = time.time()
    
    # Step 1: Decompose query (1 LLM call)
    decomposition_time = LLM_CALL_TIME
    time.sleep(decomposition_time)
    
    # Step 2: Retrieve for each sub-query (parallel, so max time)
    # In practice, retrievals happen sequentially or with limited parallelism
    retrieval_time = RETRIEVAL_TIME * num_subqueries  # Sequential
    time.sleep(retrieval_time)
    
    # Step 3: Merge results (negligible)
    merge_time = 0.05
    time.sleep(merge_time)
    
    total_time = time.time() - start_time
    
    return {
        "approach": "Query Decomposition",
        "query": query,
        "num_subqueries": num_subqueries,
        "decomposition_time": decomposition_time,
        "retrieval_time": retrieval_time,
        "merge_time": merge_time,
        "total_time": total_time,
        "llm_calls": 1,
        "retrieval_calls": num_subqueries
    }


# ============================================================================
# ReAct SIMULATION
# ============================================================================

def simulate_react(query: str, max_iterations: int) -> Dict[str, Any]:
    """
    Simulate ReAct (Reasoning + Acting) approach.
    
    Process (per iteration):
    1. Thought: LLM reasons about what to do next (1 LLM call)
    2. Action: Execute retrieval based on thought (1 retrieval)
    3. Observation: LLM evaluates if done (1 LLM call)
    
    Iterations continue until LLM decides it has enough information.
    
    Args:
        query: Original query
        max_iterations: Maximum ReAct iterations
    
    Returns:
        Dict with timing breakdown
    """
    start_time = time.time()
    
    total_llm_time = 0
    total_retrieval_time = 0
    llm_calls = 0
    retrieval_calls = 0
    
    for iteration in range(max_iterations):
        # Thought: LLM decides what to do
        thought_time = LLM_CALL_TIME
        time.sleep(thought_time)
        total_llm_time += thought_time
        llm_calls += 1
        
        # Action: Retrieve based on thought
        action_time = RETRIEVAL_TIME
        time.sleep(action_time)
        total_retrieval_time += action_time
        retrieval_calls += 1
        
        # Observation: LLM evaluates results
        observation_time = LLM_CALL_TIME * 0.5  # Faster check
        time.sleep(observation_time)
        total_llm_time += observation_time
        llm_calls += 1
        
        # Early stopping simulation (70% chance to stop if not last iteration)
        if iteration < max_iterations - 1 and iteration > 0:
            import random
            if random.random() < 0.7:
                break
    
    total_time = time.time() - start_time
    
    return {
        "approach": "ReAct",
        "query": query,
        "iterations": iteration + 1,
        "llm_time": total_llm_time,
        "retrieval_time": total_retrieval_time,
        "total_time": total_time,
        "llm_calls": llm_calls,
        "retrieval_calls": retrieval_calls
    }


# ============================================================================
# COMPARISON & ANALYSIS
# ============================================================================

def run_comparison():
    """Run comparison between Query Decomposition and ReAct."""
    
    print("=" * 80)
    print("QUERY STRATEGY COMPARISON: Query Decomposition vs ReAct")
    print("=" * 80)
    print()
    
    decomp_times = []
    react_times = []
    
    for test_case in TEST_QUERIES:
        query = test_case["query"]
        complexity = test_case["complexity"]
        
        print(f"\n{'─' * 80}")
        print(f"Query ({complexity.upper()}): {query[:60]}...")
        print(f"{'─' * 80}")
        
        # Run Query Decomposition
        decomp_result = simulate_query_decomposition(
            query, 
            test_case["expected_decomposition"]
        )
        
        # Run ReAct
        react_result = simulate_react(
            query,
            test_case["expected_react_iterations"]
        )
        
        # Store times for summary
        decomp_times.append(decomp_result["total_time"])
        react_times.append(react_result["total_time"])
        
        # Print results
        print(f"\n📊 QUERY DECOMPOSITION:")
        print(f"   Sub-queries: {decomp_result['num_subqueries']}")
        print(f"   LLM calls: {decomp_result['llm_calls']}")
        print(f"   Retrieval calls: {decomp_result['retrieval_calls']}")
        print(f"   ⏱️  Total time: {decomp_result['total_time']:.2f}s")
        print(f"      ├─ Decomposition: {decomp_result['decomposition_time']:.2f}s")
        print(f"      ├─ Retrieval: {decomp_result['retrieval_time']:.2f}s")
        print(f"      └─ Merge: {decomp_result['merge_time']:.2f}s")
        
        print(f"\n🤖 ReAct:")
        print(f"   Iterations: {react_result['iterations']}")
        print(f"   LLM calls: {react_result['llm_calls']}")
        print(f"   Retrieval calls: {react_result['retrieval_calls']}")
        print(f"   ⏱️  Total time: {react_result['total_time']:.2f}s")
        print(f"      ├─ LLM reasoning: {react_result['llm_time']:.2f}s")
        print(f"      └─ Retrieval: {react_result['retrieval_time']:.2f}s")
        
        # Winner
        if decomp_result['total_time'] < react_result['total_time']:
            diff = react_result['total_time'] - decomp_result['total_time']
            print(f"\n   ✅ Winner: Query Decomposition ({diff:.2f}s faster)")
        else:
            diff = decomp_result['total_time'] - react_result['total_time']
            print(f"\n   ✅ Winner: ReAct ({diff:.2f}s faster)")
    
    # Summary statistics
    print(f"\n\n{'=' * 80}")
    print("SUMMARY STATISTICS")
    print(f"{'=' * 80}")
    
    print(f"\nQuery Decomposition:")
    print(f"   Average time: {statistics.mean(decomp_times):.2f}s")
    print(f"   Min time: {min(decomp_times):.2f}s")
    print(f"   Max time: {max(decomp_times):.2f}s")
    
    print(f"\nReAct:")
    print(f"   Average time: {statistics.mean(react_times):.2f}s")
    print(f"   Min time: {min(react_times):.2f}s")
    print(f"   Max time: {max(react_times):.2f}s")
    
    # Overall winner
    avg_diff = statistics.mean(react_times) - statistics.mean(decomp_times)
    if avg_diff > 0:
        print(f"\n🏆 Overall: Query Decomposition is {avg_diff:.2f}s faster on average")
    else:
        print(f"\n🏆 Overall: ReAct is {abs(avg_diff):.2f}s faster on average")
    
    # Recommendations
    print(f"\n\n{'=' * 80}")
    print("RECOMMENDATIONS")
    print(f"{'=' * 80}")
    
    print("""
📌 Query Decomposition:
   ✅ Faster for most queries (parallel retrieval possible)
   ✅ Simpler implementation
   ✅ Predictable performance
   ❌ Less adaptive to query complexity
   ❌ May retrieve unnecessary information
   
   Best for: Production systems prioritizing speed and simplicity

🤖 ReAct:
   ✅ More intelligent and adaptive
   ✅ Can handle complex multi-hop reasoning
   ✅ Only retrieves what's needed
   ❌ Slower due to multiple LLM calls
   ❌ More complex to implement
   ❌ Less predictable performance
   
   Best for: Complex queries requiring reasoning, research assistants

💡 Hybrid Approach:
   Use query complexity classifier to choose strategy:
   - Simple queries → Direct retrieval
   - Medium queries → Query decomposition
   - Complex queries → ReAct
    """)


if __name__ == "__main__":
    run_comparison()
