import torch
from transformers import (
    AutoTokenizer, 
    AutoModelForSequenceClassification,
    pipeline
)
import numpy as np
from typing import Dict, List
import re
import logging

logger = logging.getLogger(__name__)

class ContentModerator:
    """
    Content moderation system using transformer models
    Uses Detoxify models for toxicity detection
    """
    
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"Using device: {self.device}")
        
        # Load toxicity detection model (lightweight)
        # Using a compact model for faster inference
        self.load_models()
        
        # Statistics tracking
        self.stats = {
            "total_requests": 0,
            "flagged_count": 0,
            "avg_latency_ms": 0
        }
        
        # Toxic keywords list (simple fallback)
        self.toxic_patterns = self._load_toxic_patterns()
        
    def load_models(self):
        """Load pre-trained models"""
        try:
            # Using unitary/toxic-bert - a BERT model fine-tuned for toxicity
            model_name = "unitary/toxic-bert"
            
            logger.info(f"Loading model: {model_name}")
            
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            self.model = AutoModelForSequenceClassification.from_pretrained(model_name)
            self.model.to(self.device)
            self.model.eval()
            
            # Labels for toxic-bert
            self.labels = ['toxic', 'severe_toxic', 'obscene', 'threat', 'insult', 'identity_hate']
            
            logger.info("Models loaded successfully!")
            
        except Exception as e:
            logger.error(f"Error loading models: {e}")
            raise
    
    def _load_toxic_patterns(self) -> List[str]:
        """Load common toxic word patterns"""
        # Simplified list - in production, use comprehensive word lists
        return [
            r'\bidiot\b', r'\bstupid\b', r'\bhate\b', r'\bkill\b',
            r'\bdumb\b', r'\bloser\b', r'\bterrible\b'
        ]
    
    def _extract_toxic_words(self, text: str) -> List[str]:
        """Extract potentially toxic words from text"""
        text_lower = text.lower()
        toxic_words = []
        
        for pattern in self.toxic_patterns:
            matches = re.findall(pattern, text_lower, re.IGNORECASE)
            toxic_words.extend(matches)
        
        return list(set(toxic_words))[:5]  # Return top 5 unique
    
    def moderate(self, text: str) -> Dict:
        """
        Moderate a single piece of text
        
        Returns:
            Dict with moderation results including scores and explanation
        """
        self.stats["total_requests"] += 1
        
        # Tokenize input
        inputs = self.tokenizer(
            text, 
            return_tensors="pt", 
            truncation=True, 
            max_length=512,
            padding=True
        ).to(self.device)
        
        # Get predictions
        with torch.no_grad():
            outputs = self.model(**inputs)
            predictions = torch.sigmoid(outputs.logits).cpu().numpy()[0]
        
        # Create category scores
        categories = {}
        threshold = 0.5
        
        for label, score in zip(self.labels, predictions):
            categories[label] = {
                "score": float(score),
                "flagged": bool(score > threshold)
            }
        
        # Overall toxicity is max of all categories
        max_score = float(max(predictions))
        is_flagged = max_score > threshold
        
        if is_flagged:
            self.stats["flagged_count"] += 1
        
        # Generate explanation
        explanation = self._generate_explanation(categories, text)
        
        # Extract toxic words
        toxic_words = self._extract_toxic_words(text)
        
        return {
            "text": text[:100] + "..." if len(text) > 100 else text,
            "is_flagged": is_flagged,
            "confidence": max_score,
            "categories": categories,
            "explanation": explanation,
            "top_toxic_words": toxic_words if toxic_words else None
        }
    
    def _generate_explanation(self, categories: Dict, text: str) -> List[str]:
        """Generate human-readable explanation for flagging"""
        explanations = []
        
        flagged_categories = [
            cat for cat, data in categories.items() 
            if data["flagged"]
        ]
        
        if not flagged_categories:
            return ["Content appears safe"]
        
        # Sort by score
        sorted_cats = sorted(
            flagged_categories,
            key=lambda x: categories[x]["score"],
            reverse=True
        )
        
        for cat in sorted_cats[:3]:  # Top 3 categories
            score = categories[cat]["score"]
            explanations.append(
                f"High {cat.replace('_', ' ')} detected (confidence: {score:.2%})"
            )
        
        # Add word-level insights
        toxic_words = self._extract_toxic_words(text)
        if toxic_words:
            explanations.append(f"Potentially problematic terms: {', '.join(toxic_words)}")
        
        return explanations
    
    def get_stats(self) -> Dict:
        """Get moderation statistics"""
        flagged_rate = (
            self.stats["flagged_count"] / self.stats["total_requests"] 
            if self.stats["total_requests"] > 0 
            else 0
        )
        
        return {
            **self.stats,
            "flagged_rate": round(flagged_rate, 4)
        }