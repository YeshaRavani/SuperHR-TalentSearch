import asyncio
import io
from backend.utils import resume_parser
from backend.services.groq_service import groq_service
from types import SimpleNamespace

async def debug_resume():
    print("Testing Resume Parsing...")
    # Mocking UploadFile
    class MockFile:
        async def read(self):
            with open("test_resume.pdf", "rb") as f:
                return f.read()
    
    try:
        text = await resume_parser.parse_resume_text(MockFile())
        print(f"Extracted text length: {len(text)}")
        print("First 200 chars of text:")
        print(text[:200])
        print("-" * 20)
    except Exception as e:
        print(f"Error parsing resume: {e}")
        return

    if not text.strip():
        print("Warning: Extracted text is empty!")

    print("Testing AI Skill Extraction...")
    system_prompt = (
        "You are an expert Talent Acquisition AI. Your task is to extract a comprehensive list of professional skills from the provided resume text. "
        "Return ONLY a JSON object with a 'skills' key containing a flat list of strings."
    )
    prompt = f"Resume text:\n{text[:6000]}"
    
    try:
        if not groq_service.is_available():
            print("Groq service is NOT available (missing API key?)")
        
        result = groq_service.get_chat_completion(prompt, system_prompt)
        print("Extracted Skills:")
        print(result.get("skills", []))
    except Exception as e:
        print(f"AI extraction failed: {e}")

if __name__ == "__main__":
    asyncio.run(debug_resume())
