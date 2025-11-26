from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field, validator
from typing import Dict, Any, Optional
from pathlib import Path
import json
import asyncio
from backend.flash.chat_manager import process_query, process_query_stream
from backend.flash.logger_config import logger

app = FastAPI(title="DataScience RAG Model API", version="1.0.0")

# Base directory for serving PDFs (defaults to <project_root>/data)
PROJECT_ROOT = Path(__file__).resolve().parents[2]
PDF_BASE_DIR = PROJECT_ROOT / "data"

# Add CORS middleware for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins like ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=5000, description="User query")
    
    @validator('query')
    def validate_query(cls, v):
        if not v or not v.strip():
            raise ValueError('Query cannot be empty or just whitespace')
        return v.strip()

class ChatResponse(BaseModel):
    query: str
    response: str
    context: Optional[str] = None
    metrics: Optional[Dict[str, str]] = None
    response_time: Optional[str] = None
    sub_queries: Optional[list] = None
    related_questions: Optional[list] = None
    diagram_images: Optional[list] = None
    error: Optional[str] = None

class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None

@app.get("/")
def home():
    """Root endpoint"""
    return {
        "message": "DataScience RAG Model API",
        "status": "running",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "chat_http": "/chat_response?query=your_query",
            "chat_websocket": "/ws/chat"
        }
    }

@app.get("/health")
def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "service": "DataScience RAG Model API"
    }


@app.get("/pdf/{pdf_path:path}")
def get_pdf(pdf_path: str):
    """Serve PDF files from the data directory so they can be viewed in the browser.

    Example: GET /pdf/mydoc.pdf -> serves <project_root>/data/mydoc.pdf
    """
    # Resolve the requested path under the PDF base directory
    requested_path = (PDF_BASE_DIR / pdf_path).resolve()

    # Security: ensure the resolved path is still under PDF_BASE_DIR
    if PDF_BASE_DIR not in requested_path.parents and requested_path != PDF_BASE_DIR:
        raise HTTPException(status_code=400, detail="Invalid PDF path")

    # Only allow existing .pdf files
    if not requested_path.is_file() or requested_path.suffix.lower() != ".pdf":
        # Fallback: Try to find the file recursively in PDF_BASE_DIR
        found = False
        if requested_path.suffix.lower() == ".pdf":
             filename = requested_path.name
             for file in PDF_BASE_DIR.rglob(filename):
                 if file.is_file():
                     requested_path = file
                     found = True
                     break
        
        if not found:
            raise HTTPException(status_code=404, detail="PDF not found")

    return FileResponse(str(requested_path), media_type="application/pdf")

@app.get("/images/{image_path:path}")
def get_image(image_path: str):
    """Serve image files from the data/rag_output directory.
    
    Example: GET /images/diagram.png -> serves <project_root>/data/rag_output/diagram.png
    """
    # Base directory for images
    IMAGE_BASE_DIR = PROJECT_ROOT / "data" / "rag_output"
    
    # Resolve the requested path under the image base directory
    requested_path = (IMAGE_BASE_DIR / image_path).resolve()
    
    # Security: ensure the resolved path is still under IMAGE_BASE_DIR
    if IMAGE_BASE_DIR not in requested_path.parents and requested_path != IMAGE_BASE_DIR:
        raise HTTPException(status_code=400, detail="Invalid image path")
    
    # Only allow existing image files
    allowed_extensions = {".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp"}
    if not requested_path.is_file() or requested_path.suffix.lower() not in allowed_extensions:
        # Fallback: Try to find the file recursively in IMAGE_BASE_DIR
        found = False
        if requested_path.suffix.lower() in allowed_extensions:
            filename = requested_path.name
            for file in IMAGE_BASE_DIR.rglob(filename):
                if file.is_file():
                    requested_path = file
                    found = True
                    break
        
        if not found:
            raise HTTPException(status_code=404, detail="Image not found")
    
    # Determine media type based on extension
    media_types = {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".gif": "image/gif",
        ".svg": "image/svg+xml",
        ".webp": "image/webp"
    }
    media_type = media_types.get(requested_path.suffix.lower(), "image/png")
    
    return FileResponse(str(requested_path), media_type=media_type)

@app.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time chat"""
    client_id = id(websocket)
    await websocket.accept()
    logger.info(f"WebSocket connection accepted from client {client_id}")
    
    # Initialize chat history for this session
    chat_history = []
    
    try:
        while True:
            # Receive message
            raw_data = await websocket.receive_text()
            logger.info(f"Received WebSocket message from client {client_id}: {raw_data[:100]}...")
            
            # Validate input
            if not raw_data or not raw_data.strip():
                await websocket.send_json({
                    "error": "Empty query received",
                    "query": raw_data
                })
                continue

            # Parse JSON or fallback to raw string
            query = ""
            model_name = "google_flash"
            
            try:
                # Try parsing as JSON
                json_data = json.loads(raw_data)
                if isinstance(json_data, dict):
                    query = json_data.get("query", "")
                    model_name = json_data.get("model", "google_flash")
                else:
                    # If valid JSON but not a dict (e.g. list or string), treat as raw query
                    query = raw_data
            except json.JSONDecodeError:
                # Not JSON, treat as raw query string (legacy support)
                query = raw_data
            
            # Final validation of query
            if not query or not query.strip():
                 await websocket.send_json({
                    "error": "Empty query received",
                    "query": query
                })
                 continue

            # Limit query length
            if len(query) > 5000:
                await websocket.send_json({
                    "error": "Query too long. Maximum 5000 characters.",
                    "query": query[:100] + "..."
                })
                continue
            
            try:
                # Process query with chat history using streaming
                async for chunk in process_query_stream(query.strip(), model_name=model_name, chat_history=chat_history):
                    await websocket.send_json(chunk)
                    
                    # If complete, update chat history
                    if chunk.get("type") == "complete":
                        data = chunk.get("data", {})
                        logger.info(f"Sent complete WebSocket response to client {client_id}")
                        
                        # Update chat history
                        chat_history.append({"role": "user", "content": query.strip()})
                        chat_history.append({"role": "assistant", "content": data.get("response", "")})
                        
                        # Keep only the last 10 messages to manage context window
                        if len(chat_history) > 10:
                            chat_history = chat_history[-10:]
                    
            except Exception as e:
                logger.error(f"Error processing query for client {client_id}: {e}", exc_info=True)
                await websocket.send_json({
                    "type": "error",
                    "error": "Internal server error while processing query",
                    "detail": str(e),
                    "query": query
                })
            
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for client {client_id}")
    except Exception as e:
        logger.error(f"WebSocket error for client {client_id}: {e}", exc_info=True)
        try:
            await websocket.close()
        except:
            pass

# HTTP endpoint for backward compatibility or testing
@app.get('/chat_response', response_model=ChatResponse)
async def chat_get(query: str):
    """HTTP GET endpoint for chat"""
    try:
        # Validate query
        if not query or not query.strip():
            raise HTTPException(status_code=400, detail="Query cannot be empty")
        
        if len(query) > 5000:
            raise HTTPException(status_code=400, detail="Query too long. Maximum 5000 characters.")
        
        # Process query
        result = await process_query(query.strip())
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in HTTP chat endpoint: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post('/chat', response_model=ChatResponse)
async def chat_post(request: ChatRequest):
    """HTTP POST endpoint for chat"""
    try:
        # Process query (validation already done by Pydantic)
        result = await process_query(request.query)
        return result
        
    except Exception as e:
        logger.error(f"Error in HTTP POST chat endpoint: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
