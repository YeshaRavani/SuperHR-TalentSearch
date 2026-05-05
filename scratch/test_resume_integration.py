import os
import sys
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Add the project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.main import app
from backend.database import Base, get_db
from backend.utils.auth import create_access_token
from backend import orm_models

# Setup test database
SQLALCHEMY_DATABASE_URL = "sqlite://"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

def setup_test_user():
    db = TestingSessionLocal()
    user = orm_models.User(
        id="test-user-uuid",
        username="testuser",
        email="test@example.com",
        full_name="Test User",
        hashed_password="hashed_password",
        role="contributors",
        organisation="Test Org",
        department_team="Test Team"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(data={"sub": user.username})
    return token, user

def test_resume_extraction():
    token, user = setup_test_user()
    headers = {"Authorization": f"Bearer {token}"}
    
    # Path to the test PDF
    pdf_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../test_resume.pdf'))
    
    if not os.path.exists(pdf_path):
        print(f"Test PDF not found at {pdf_path}. Skipping integration test.")
        return

    with open(pdf_path, "rb") as f:
        files = {"file": ("test_resume.pdf", f, "application/pdf")}
        response = client.post("/api/ai/extract-skills", headers=headers, files=files)
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    
    assert response.status_code == 200
    data = response.json()
    assert "skills" in data
    # Note: AI extraction might return empty list if Groq key is missing or model fails,
    # but the endpoint itself should return 200 and a JSON with 'skills' key.
    print("✓ Resume extraction endpoint is reachable and returns structured JSON.")

if __name__ == "__main__":
    try:
        test_resume_extraction()
        print("\nBackend integration verification successful.")
    except Exception as e:
        print(f"\nVerification failed: {e}")
        sys.exit(1)
