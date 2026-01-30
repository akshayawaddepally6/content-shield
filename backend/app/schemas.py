from pydantic import BaseModel, Field
from typing import Dict, List, Optional

class ModerationRequest(BaseModel):
    """Request schema for content moderation"""
    text: str = Field(..., min_length=1, max_length=5000, description="Text content to moderate")
    
    class Config:
        json_schema_extra = {
            "example": {
                "text": "This is sample text to check for toxicity"
            }
        }

class CategoryScore(BaseModel):
    """Score for a specific moderation category"""
    score: float = Field(..., ge=0.0, le=1.0)
    flagged: bool

class ModerationResponse(BaseModel):
    """Response schema for moderation results"""
    text: str
    is_flagged: bool
    confidence: float = Field(..., ge=0.0, le=1.0)
    categories: Dict[str, CategoryScore]
    explanation: Optional[List[str]] = None
    top_toxic_words: Optional[List[str]] = None
    latency_ms: Optional[float] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "text": "Sample text",
                "is_flagged": True,
                "confidence": 0.87,
                "categories": {
                    "toxicity": {"score": 0.87, "flagged": True},
                    "hate_speech": {"score": 0.23, "flagged": False},
                    "threat": {"score": 0.12, "flagged": False}
                },
                "explanation": ["High toxicity detected in language"],
                "top_toxic_words": ["word1", "word2"],
                "latency_ms": 45.23
            }
        }