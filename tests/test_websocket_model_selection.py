#!/usr/bin/env python3
"""
WebSocket endpoint test for model selection.
Tests that the WebSocket correctly passes model selection to the backend.
"""

import asyncio
import json
import sys
import websockets
from pathlib import Path

# Test configurations
WEBSOCKET_URL = "ws://localhost:8000/ws/chat"
TEST_QUERIES = [
    {"query": "What is machine learning?", "model": "google_flash"},
    {"query": "Explain neural networks", "model": "google_pro"},
    {"query": "What is deep learning?", "model": "google_flash"},
    {"query": "Invalid model test", "model": "invalid_model"},
]

class WebSocketTestResults:
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
        print("WEBSOCKET TEST SUMMARY")
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

async def test_websocket_model_selection():
    """Test WebSocket model selection"""
    results = WebSocketTestResults()
    
    print("\n" + "="*80)
    print("WEBSOCKET MODEL SELECTION TEST")
    print("="*80)
    print(f"Connecting to: {WEBSOCKET_URL}")
    print("="*80)
    
    try:
        async with websockets.connect(WEBSOCKET_URL) as websocket:
            print("✓ WebSocket connection established")
            
            for i, test_case in enumerate(TEST_QUERIES, 1):
                test_name = f"Test {i}: {test_case['model']}"
                print(f"\n{'='*80}")
                print(f"Running: {test_name}")
                print(f"Query: {test_case['query']}")
                print(f"Model: {test_case['model']}")
                print(f"{'='*80}")
                
                try:
                    # Send query with model selection
                    await websocket.send(json.dumps(test_case))
                    print(f"✓ Sent query to server")
                    
                    # Receive response
                    response_raw = await asyncio.wait_for(websocket.recv(), timeout=60.0)
                    response = json.loads(response_raw)
                    
                    print(f"✓ Received response from server")
                    
                    # Verify response structure
                    if "error" in response:
                        print(f"⚠ Server returned error: {response['error']}")
                        if test_case['model'] == "invalid_model":
                            # This is expected - should fallback to default
                            print(f"✓ Expected behavior for invalid model")
                        else:
                            results.add_test(test_name, False, f"Error: {response['error']}")
                            continue
                    
                    # Check model_used field
                    if "model_used" not in response:
                        results.add_test(test_name, False, "Missing 'model_used' field")
                        print(f"✗ FAIL: Missing 'model_used' field")
                        continue
                    
                    # Verify correct model was used
                    expected_model = test_case['model'] if test_case['model'] in ["google_flash", "google_pro"] else "google_flash"
                    actual_model = response["model_used"]
                    
                    print(f"✓ Model Used: {actual_model}")
                    print(f"✓ Response Length: {len(response.get('response', ''))} characters")
                    
                    # Verify no 'responses' key (multi-model execution)
                    if "responses" in response:
                        results.add_test(
                            test_name,
                            False,
                            "CRITICAL: Found 'responses' key - multiple models executed!"
                        )
                        print(f"✗ FAIL: Multiple models were executed!")
                        continue
                    
                    # Verify correct model
                    if actual_model != expected_model:
                        results.add_test(
                            test_name,
                            False,
                            f"Expected '{expected_model}' but got '{actual_model}'"
                        )
                        print(f"✗ FAIL: Wrong model used")
                        continue
                    
                    # Verify response content
                    if not response.get("response") or len(response["response"]) < 10:
                        results.add_test(test_name, False, "Invalid or empty response")
                        print(f"✗ FAIL: Invalid response")
                        continue
                    
                    results.add_test(
                        test_name,
                        True,
                        f"Correctly used '{actual_model}'"
                    )
                    print(f"✓ PASS: Only '{actual_model}' was invoked")
                    print(f"✓ Response preview: {response['response'][:100]}...")
                    
                except asyncio.TimeoutError:
                    results.add_test(test_name, False, "Timeout waiting for response")
                    print(f"✗ FAIL: Timeout")
                except Exception as e:
                    results.add_test(test_name, False, f"Exception: {str(e)}")
                    print(f"✗ FAIL: {e}")
                
                # Small delay between tests
                await asyncio.sleep(1)
            
            print("\n✓ Closing WebSocket connection")
    
    except Exception as e:
        print(f"\n✗ Failed to connect to WebSocket: {e}")
        print(f"⚠ Make sure the server is running at {WEBSOCKET_URL}")
        results.add_test("WebSocket Connection", False, str(e))
    
    # Print summary
    all_passed = results.print_summary()
    
    if all_passed:
        print("\n🎉 ALL WEBSOCKET TESTS PASSED! 🎉")
        print("✓ WebSocket correctly passes model selection to backend")
        print("✓ Only selected model is invoked")
        return 0
    else:
        print("\n❌ SOME WEBSOCKET TESTS FAILED")
        return 1

async def main():
    """Run WebSocket tests"""
    exit_code = await test_websocket_model_selection()
    return exit_code

if __name__ == "__main__":
    try:
        exit_code = asyncio.run(main())
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\n\n⚠ Tests interrupted by user")
        sys.exit(1)
