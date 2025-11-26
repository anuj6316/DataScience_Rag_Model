#!/bin/bash
# Quick test runner script for model selection tests

echo "=================================="
echo "Model Selection Test Runner"
echo "=================================="
echo ""

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "❌ Error: Virtual environment not found"
    echo "Please create a virtual environment first:"
    echo "  python3 -m venv venv"
    exit 1
fi

# Activate venv
source venv/bin/activate

echo "Running Direct Function Tests..."
echo "=================================="
python3 tests/test_model_selection.py
DIRECT_EXIT=$?

echo ""
echo ""
echo "Running WebSocket Integration Tests..."
echo "=================================="

# Check if server is running
if ! pgrep -f "uvicorn.*main:app" > /dev/null; then
    echo "⚠️  Warning: Server not running"
    echo "Please start the server in another terminal:"
    echo "  source venv/bin/activate"
    echo "  uvicorn backend.core.main:app --reload"
    echo ""
    read -p "Press Enter when server is ready, or Ctrl+C to skip WebSocket tests..."
fi

python3 tests/test_websocket_model_selection.py
WS_EXIT=$?

echo ""
echo "=================================="
echo "Test Summary"
echo "=================================="
if [ $DIRECT_EXIT -eq 0 ]; then
    echo "✅ Direct Function Tests: PASSED"
else
    echo "❌ Direct Function Tests: FAILED"
fi

if [ $WS_EXIT -eq 0 ]; then
    echo "✅ WebSocket Tests: PASSED"
else
    echo "❌ WebSocket Tests: FAILED"
fi

echo "=================================="

# Exit with error if any test failed
if [ $DIRECT_EXIT -ne 0 ] || [ $WS_EXIT -ne 0 ]; then
    exit 1
fi

exit 0
