import json
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from backend.core import main


client = TestClient(main.app)


@pytest.fixture
def mock_process_query(monkeypatch):
    """Mock backend.flash.chat_manager.process_query used in all chat endpoints.

    Returns a minimal structure compatible with ChatResponse.
    """

    async def _mock_process_query(query: str, model_name: str = "google_flash", chat_history: list = None):  # pragma: no cover - implementation detail
        return {
            "query": query,
            "response": f"echo:{query}",
            "context": "dummy-context",
            "metrics": {"pipeline_time": "0.1s"},
            "response_time": "0.1s",
            "sub_queries": [query],
            "diagram_images": [],
            "model_used": model_name,
        }

    monkeypatch.setattr(main, "process_query", _mock_process_query)
    return _mock_process_query


# ---------------------------------------------------------------------------
# Basic metadata endpoints
# ---------------------------------------------------------------------------


def test_home_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()

    assert data["message"] == "DataScience RAG Model API"
    assert data["status"] == "running"
    assert data["version"] == "1.0.0"
    assert "endpoints" in data
    assert data["endpoints"]["health"] == "/health"
    assert data["endpoints"]["chat_http"].startswith("/chat_response")
    assert data["endpoints"]["chat_websocket"] == "/ws/chat"


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()

    assert data == {
        "status": "healthy",
        "service": "DataScience RAG Model API",
    }


# ---------------------------------------------------------------------------
# PDF serving endpoint
# ---------------------------------------------------------------------------


def test_get_pdf_success(monkeypatch, tmp_path):
    """PDF exists under PDF_BASE_DIR -> 200 with application/pdf content type."""
    original_base_dir = main.PDF_BASE_DIR
    monkeypatch.setattr(main, "PDF_BASE_DIR", tmp_path)

    pdf_file = tmp_path / "test.pdf"
    pdf_file.write_bytes(b"%PDF-1.4\n%dummy pdf content")

    try:
        response = client.get("/pdf/test.pdf")
    finally:
        monkeypatch.setattr(main, "PDF_BASE_DIR", original_base_dir)

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("application/pdf")


def test_get_pdf_not_found(monkeypatch, tmp_path):
    """Non-existent PDF should return 404 with appropriate detail."""
    original_base_dir = main.PDF_BASE_DIR
    monkeypatch.setattr(main, "PDF_BASE_DIR", tmp_path)

    try:
        response = client.get("/pdf/missing.pdf")
    finally:
        monkeypatch.setattr(main, "PDF_BASE_DIR", original_base_dir)

    assert response.status_code == 404
    assert response.json()["detail"] == "PDF not found"


def test_get_pdf_non_pdf_extension(monkeypatch, tmp_path):
    """Existing non-PDF file under base dir should still return 404."""
    original_base_dir = main.PDF_BASE_DIR
    monkeypatch.setattr(main, "PDF_BASE_DIR", tmp_path)

    non_pdf = tmp_path / "note.txt"
    non_pdf.write_text("hello")

    try:
        response = client.get("/pdf/note.txt")
    finally:
        monkeypatch.setattr(main, "PDF_BASE_DIR", original_base_dir)

    assert response.status_code == 404
    assert response.json()["detail"] == "PDF not found"


def test_get_pdf_path_traversal_rejected(monkeypatch, tmp_path):
    """Path traversal attempts (../) must be rejected with 400."""
    original_base_dir = main.PDF_BASE_DIR
    monkeypatch.setattr(main, "PDF_BASE_DIR", tmp_path)

    # Even if a file exists outside base dir, the API must not serve it
    parent_pdf = tmp_path.parent / "evil.pdf"
    parent_pdf.write_bytes(b"%PDF-1.4\n%evil")

    try:
        # Use encoded slash to avoid client normalization
        response = client.get("/pdf/..%2Fevil.pdf")
    finally:
        monkeypatch.setattr(main, "PDF_BASE_DIR", original_base_dir)

    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid PDF path"


# ---------------------------------------------------------------------------
# HTTP chat endpoints (/chat_response and /chat)
# ---------------------------------------------------------------------------


def test_chat_get_success(mock_process_query):
    response = client.get("/chat_response", params={"query": "hello"})
    assert response.status_code == 200
    data = response.json()

    # Response model filters to ChatResponse fields
    assert data["query"] == "hello"
    assert data["response"] == "echo:hello"
    # Optional fields may or may not be present depending on FastAPI's filtering


def test_chat_get_empty_query_rejected():
    response = client.get("/chat_response", params={"query": ""})
    assert response.status_code == 400
    assert response.json()["detail"] == "Query cannot be empty"


def test_chat_get_whitespace_query_rejected():
    response = client.get("/chat_response", params={"query": "   "})
    assert response.status_code == 400
    assert response.json()["detail"] == "Query cannot be empty"


def test_chat_get_too_long_query_rejected():
    long_query = "x" * 5001
    response = client.get("/chat_response", params={"query": long_query})
    assert response.status_code == 400
    assert response.json()["detail"] == "Query too long. Maximum 5000 characters."


def test_chat_get_internal_error_propagated(monkeypatch):
    async def _raising_process_query(query: str):  # pragma: no cover - error path
        raise RuntimeError("boom")

    monkeypatch.setattr(main, "process_query", _raising_process_query)

    response = client.get("/chat_response", params={"query": "hello"})
    assert response.status_code == 500
    # Detail should contain the internal error message prefix
    assert "Internal server error" in response.json()["detail"]


def test_chat_post_success(mock_process_query):
    """Valid POST /chat should pass validated query to process_query and return 200."""
    response = client.post("/chat", json={"query": "  hello  "})
    assert response.status_code == 200
    data = response.json()

    # ChatRequest strips whitespace in validator
    assert data["query"] == "hello"
    assert data["response"] == "echo:hello"


def test_chat_post_empty_body_query_validation_error():
    """Pydantic validation should reject empty/whitespace queries with 422."""
    response = client.post("/chat", json={"query": "   "})
    assert response.status_code == 422

    # Ensure the validation error mentions our custom message
    errors = response.json()["detail"]
    # Look for any error entry mentioning our validator message
    assert any("Query cannot be empty or just whitespace" in json.dumps(err) for err in errors)


def test_chat_post_too_long_body_query_validation_error():
    long_query = "x" * 5001
    response = client.post("/chat", json={"query": long_query})
    assert response.status_code == 422

    errors = response.json()["detail"]
    # Pydantic enforces max_length at the schema level
    # Pydantic V2 error message is different
    assert any("5000 characters" in json.dumps(err) for err in errors)


def test_chat_post_internal_error(monkeypatch):
    async def _raising_process_query(query: str):  # pragma: no cover - error path
        raise RuntimeError("boom")

    monkeypatch.setattr(main, "process_query", _raising_process_query)

    response = client.post("/chat", json={"query": "hello"})
    assert response.status_code == 500
    assert "Internal server error" in response.json()["detail"]


# ---------------------------------------------------------------------------
# WebSocket chat endpoint (/ws/chat)
# ---------------------------------------------------------------------------


def test_websocket_chat_success(mock_process_query):
    with client.websocket_connect("/ws/chat") as websocket:
        websocket.send_text("hello")
        data = websocket.receive_json()

        assert data["query"] == "hello"
        assert data["response"] == "echo:hello"


def test_websocket_chat_empty_query_error():
    with client.websocket_connect("/ws/chat") as websocket:
        websocket.send_text("")
        data = websocket.receive_json()

        assert data["error"] == "Empty query received"
        assert data["query"] == ""


def test_websocket_chat_whitespace_query_error():
    with client.websocket_connect("/ws/chat") as websocket:
        websocket.send_text("   ")
        data = websocket.receive_json()

        assert data["error"] == "Empty query received"
        assert data["query"] == "   "


def test_websocket_chat_too_long_query_error():
    long_query = "x" * 5001
    with client.websocket_connect("/ws/chat") as websocket:
        websocket.send_text(long_query)
        data = websocket.receive_json()

        assert data["error"] == "Query too long. Maximum 5000 characters."
        # The query in the response is truncated with "..."
        assert data["query"].startswith("x" * 100)
        assert data["query"].endswith("...")


def test_websocket_chat_internal_error(monkeypatch):
    async def _raising_process_query(query: str):  # pragma: no cover - error path
        raise RuntimeError("boom")

    monkeypatch.setattr(main, "process_query", _raising_process_query)

    with client.websocket_connect("/ws/chat") as websocket:
        websocket.send_text("hello")
        data = websocket.receive_json()

        assert data["error"] == "Internal server error while processing query"
        assert data["query"] == "hello"