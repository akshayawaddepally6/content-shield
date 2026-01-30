import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_moderate_safe_content():
    """Test moderation with safe content"""
    response = client.post(
        "/moderate",
        json={"text": "This is a nice and friendly message!"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "is_flagged" in data
    assert "confidence" in data
    assert "categories" in data

def test_moderate_toxic_content():
    """Test moderation with potentially toxic content"""
    response = client.post(
        "/moderate",
        json={"text": "You are an idiot and stupid person"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "is_flagged" in data
    assert "confidence" in data
    
def test_moderate_empty_text():
    """Test that empty text is rejected"""
    response = client.post(
        "/moderate",
        json={"text": ""}
    )
    assert response.status_code == 422  # Validation error

def test_batch_moderate():
    """Test batch moderation endpoint"""
    texts = [
        "Hello, how are you?",
        "This is terrible and awful",
        "Have a great day!"
    ]
    response = client.post("/batch-moderate", json=texts)
    assert response.status_code == 200
    data = response.json()
    assert "results" in data
    assert len(data["results"]) == 3

def test_stats_endpoint():
    """Test statistics endpoint"""
    response = client.get("/stats")
    assert response.status_code == 200
    data = response.json()
    assert "total_requests" in data