from fastapi import UploadFile
from backend.routers.ai import extract_skills
from backend.orm_models import User
from backend.database import SessionLocal
import asyncio
import io

async def test_endpoint():
    # Mocking UploadFile
    class MockFile:
        def __init__(self, filename, content):
            self.filename = filename
            self.content = content
            self.file = io.BytesIO(content)
        async def read(self):
            return self.content
        def seek(self, offset):
            self.file.seek(offset)

    with open("test_resume.pdf", "rb") as f:
        content = f.read()
    
    mock_file = MockFile("test_resume.pdf", content)
    
    # Mock user and DB
    user = User(id="test-user", full_name="Test User", role="contributors")
    db = SessionLocal()
    
    print("Calling extract_skills endpoint...")
    try:
        result = await extract_skills(file=mock_file, current_user=user, db=db)
        print("Result:", result)
    except Exception as e:
        print("Endpoint crashed:", e)
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(test_endpoint())
