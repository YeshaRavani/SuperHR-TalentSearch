import fitz  # PyMuPDF
import io

async def parse_resume_text(file) -> str:
    """Extracts text from a PDF file."""
    content = await file.read()
    print(f"DEBUG: Read {len(content)} bytes from uploaded file")
    doc = fitz.open(stream=io.BytesIO(content), filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()
    return text
