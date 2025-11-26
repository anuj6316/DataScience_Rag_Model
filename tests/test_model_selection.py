#!/usr/bin/env python3
"""
Comprehensive test suite for model selection bug fix.
Tests that only the selected model generates responses.
"""

import asyncio
import json
import sys
import time
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.flash.chat_manager import process_query
from backend.flash.logger_config import logger

# Test configurations
TEST_QUERY = "What is machine learning?"
TEST_MODELS = ["google_flash", "google_pro", "invalid_model", None]

class TestResults:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.tests = []
    
    def add_test(self, name, passed, message=""):
        self.tests.append({
            "name": name,
            "passed": passed,
            "message": message
        })
        if passed:
            self.passed += 1
        else:
            self.failed += 1
    
    def print_summary(self):
        print("\n" + "="*80)
        print("TEST SUMMARY")
        print("="*80)
        for test in self.tests:
            status = "✓ PASS" if test["passed"] else "✗ FAIL"
            print(f"{status}: {test['name']}")
            if test["message"]:
                print(f"  → {test['message']}")
        print("="*80)
        print(f"Total: {self.passed + self.failed} | Passed: {self.passed} | Failed: {self.failed}")
        print("="*80)
        return self.failed == 0

async def test_model_selection(model_name, results):
    """Test that only the selected model is invoked"""
    test_name = f"Model Selection: {model_name}"
    print(f"\n{'='*80}")
    print(f"Testing: {test_name}")
    print(f"{'='*80}")
    
    try:
        start_time = time.time()
        result = await process_query(TEST_QUERY, model_name=model_name)
        elapsed = time.time() - start_time
        
        # Verify result structure
        assert "query" in result, "Missing 'query' in result"
        assert "response" in result, "Missing 'response' in result"
        assert "model_used" in result, "Missing 'model_used' in result"
        assert "metrics" in result, "Missing 'metrics' in result"
        
        # Verify the correct model was used
        expected_model = model_name if model_name in ["google_flash", "google_pro"] else "google_flash"
        actual_model = result["model_used"]
        
        print(f"✓ Query: {result['query']}")
        print(f"✓ Model Used: {actual_model}")
        print(f"✓ Response Length: {len(result['response'])} characters")
        print(f"✓ Response Time: {elapsed:.2f}s")
        print(f"✓ Metrics: {result['metrics']}")
        
        # Verify no 'responses' key (which would indicate multi-model execution)
        if "responses" in result:
            results.add_test(
                test_name,
                False,
                "FAIL: Found 'responses' key - multiple models were executed!"
            )
            print(f"✗ FAIL: Multiple models executed (found 'responses' key)")
            return False
        
        # Verify correct model was used
        if actual_model != expected_model:
            results.add_test(
                test_name,
                False,
                f"Expected model '{expected_model}' but got '{actual_model}'"
            )
            print(f"✗ FAIL: Wrong model used")
            return False
        
        # Verify response is not empty
        if not result["response"] or len(result["response"]) < 10:
            results.add_test(
                test_name,
                False,
                "Response is empty or too short"
            )
            print(f"✗ FAIL: Invalid response")
            return False
        
        results.add_test(
            test_name,
            True,
            f"Model '{actual_model}' correctly selected and invoked"
        )
        print(f"✓ PASS: Only '{actual_model}' was invoked")
        return True
        
    except Exception as e:
        results.add_test(test_name, False, f"Exception: {str(e)}")
        print(f"✗ FAIL: Exception occurred: {e}")
        return False

async def test_edge_cases(results):
    """Test edge cases"""
    print(f"\n{'='*80}")
    print("Testing Edge Cases")
    print(f"{'='*80}")
    
    # Test 1: Empty query
    test_name = "Edge Case: Empty Query"
    try:
        result = await process_query("", model_name="google_flash")
        # Should handle gracefully or return error
        if "error" in result or result.get("response"):
            results.add_test(test_name, True, "Handled gracefully")
            print(f"✓ PASS: {test_name}")
        else:
            results.add_test(test_name, False, "Unexpected behavior")
            print(f"✗ FAIL: {test_name}")
    except Exception as e:
        # Exception is acceptable for empty query
        results.add_test(test_name, True, f"Raised exception as expected: {type(e).__name__}")
        print(f"✓ PASS: {test_name} - Exception raised as expected")
    
    # Test 2: Very long query
    test_name = "Edge Case: Long Query"
    try:
        long_query = "What is machine learning? " * 100
        result = await process_query(long_query, model_name="google_flash")
        if result.get("response"):
            results.add_test(test_name, True, "Handled long query")
            print(f"✓ PASS: {test_name}")
        else:
            results.add_test(test_name, False, "Failed to handle long query")
            print(f"✗ FAIL: {test_name}")
    except Exception as e:
        results.add_test(test_name, False, f"Exception: {str(e)}")
        print(f"✗ FAIL: {test_name} - {e}")
    
    # Test 3: Special characters in query
    test_name = "Edge Case: Special Characters"
    try:
        special_query = "What is ML? <script>alert('test')</script> & symbols: @#$%"
        result = await process_query(special_query, model_name="google_flash")
        if result.get("response"):
            results.add_test(test_name, True, "Handled special characters")
            print(f"✓ PASS: {test_name}")
        else:
            results.add_test(test_name, False, "Failed to handle special characters")
            print(f"✗ FAIL: {test_name}")
    except Exception as e:
        results.add_test(test_name, False, f"Exception: {str(e)}")
        print(f"✗ FAIL: {test_name} - {e}")

async def test_chat_history(results):
    """Test with chat history"""
    test_name = "Chat History Support"
    print(f"\n{'='*80}")
    print(f"Testing: {test_name}")
    print(f"{'='*80}")
    
    try:
        chat_history = [
            {"role": "user", "content": "What is AI?"},
            {"role": "assistant", "content": "AI stands for Artificial Intelligence..."}
        ]
        result = await process_query(
            "Can you explain more?",
            model_name="google_flash",
            chat_history=chat_history
        )
        
        if result.get("response") and "model_used" in result:
            results.add_test(test_name, True, "Chat history processed correctly")
            print(f"✓ PASS: {test_name}")
            print(f"  Response: {result['response'][:100]}...")
        else:
            results.add_test(test_name, False, "Failed to process chat history")
            print(f"✗ FAIL: {test_name}")
    except Exception as e:
        results.add_test(test_name, False, f"Exception: {str(e)}")
        print(f"✗ FAIL: {test_name} - {e}")

async def main():
    """Run all tests"""
    print("\n" + "="*80)
    print("COMPREHENSIVE MODEL SELECTION TEST SUITE")
    print("="*80)
    print("Testing that only the selected model generates responses")
    print("="*80)
    
    results = TestResults()
    
    # Test each model
    for model in TEST_MODELS:
        await test_model_selection(model, results)
        await asyncio.sleep(1)  # Small delay between tests
    
    # Test edge cases
    await test_edge_cases(results)
    
    # Test chat history
    await test_chat_history(results)
    
    # Print summary
    all_passed = results.print_summary()
    
    if all_passed:
        print("\n🎉 ALL TESTS PASSED! 🎉")
        print("✓ Only the selected model is being invoked")
        print("✓ No parallel execution of multiple models")
        print("✓ Edge cases handled correctly")
        return 0
    else:
        print("\n❌ SOME TESTS FAILED")
        print("Please review the failures above")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
