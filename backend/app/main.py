from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import time
from typing import Optional
import logging

from .moderation import ContentModerator
from .schemas import ModerationRequest, ModerationResponse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Content Shield API",
    description="Real-time content moderation with explainability",
    version="1.0.0"
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with your Vercel domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize moderator (singleton pattern)
moderator = None

@app.on_event("startup")
async def startup_event():
    """Load ML models on startup"""
    global moderator
    logger.info("Loading moderation models...")
    moderator = ContentModerator()
    logger.info("Models loaded successfully!")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Content Shield API",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "models_loaded": moderator is not None,
        "timestamp": time.time()
    }

@app.post("/moderate", response_model=ModerationResponse)
async def moderate_content(request: ModerationRequest):
    """
    Moderate text content for toxicity, hate speech, and other harmful content
    
    Returns:
    - is_flagged: Whether content should be moderated
    - confidence: Model confidence score
    - categories: Breakdown by category
    - explanation: Why it was flagged (explainability)
    """
    if moderator is None:
        raise HTTPException(status_code=503, detail="Models not loaded yet")
    
    try:
        start_time = time.time()
        
        # Run moderation
        result = moderator.moderate(request.text)
        
        # Calculate latency
        latency_ms = (time.time() - start_time) * 1000
        
        # Add latency to response
        result["latency_ms"] = round(latency_ms, 2)
        
        logger.info(f"Moderation completed in {latency_ms:.2f}ms - Flagged: {result['is_flagged']}")
        
        return result
        
    except Exception as e:
        logger.error(f"Moderation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Moderation failed: {str(e)}")

@app.post("/batch-moderate")
async def batch_moderate(texts: list[str]):
    """Batch moderation endpoint for multiple texts"""
    if moderator is None:
        raise HTTPException(status_code=503, detail="Models not loaded yet")
    
    try:
        results = []
        for text in texts[:100]:  # Limit to 100 items
            result = moderator.moderate(text)
            results.append(result)
        
        return {
            "results": results,
            "total_processed": len(results)
        }
    except Exception as e:
        logger.error(f"Batch moderation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Batch moderation failed: {str(e)}")

@app.get("/stats")
async def get_stats():
    """Get API statistics"""
    if moderator is None:
        raise HTTPException(status_code=503, detail="Models not loaded yet")
    
    return moderator.get_stats()