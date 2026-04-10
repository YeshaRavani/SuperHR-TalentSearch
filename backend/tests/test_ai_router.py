from fastapi.testclient import TestClient

from backend.main import app


def test_ai_chat_allows_anonymous_platform_questions():
    client = TestClient(app)

    response = client.post("/api/ai/chat", json={"message": "How does this platform work?"})

    assert response.status_code == 200
    payload = response.json()
    assert "reply" in payload
    assert "suggested_actions" in payload
    assert payload["reply"]
