import json
import logging
from ..config import settings

logger = logging.getLogger(__name__)

class GroqService:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.model = settings.GROQ_MODEL
        self.client = None
        self._attempted_init = False

    def _ensure_client(self) -> None:
        if self._attempted_init:
            return

        self._attempted_init = True
        if not self.api_key:
            logger.info("Groq client disabled because GROQ_API_KEY is not configured")
            return

        try:
            from groq import Groq
        except ModuleNotFoundError:
            logger.warning("Groq package is not installed in the current Python environment")
            return

        try:
            self.client = Groq(api_key=self.api_key)
        except Exception as e:
            logger.error(f"Failed to initialize Groq client: {e}")
            self.client = None

    def is_available(self) -> bool:
        self._ensure_client()
        return self.client is not None

    def get_chat_completion(self, prompt: str, system_prompt: str):
        if not self.is_available():
            # Mock fallback for testing if API key is missing
            logger.warning("Groq key missing, using mock skill extraction")
            mock_skills = [
                "Python", "FastAPI", "React", "AWS", "Docker", "Git", "SQL", "Tailwind CSS",
                "Javascript", "TypeScript", "Node.js", "Express", "PostgreSQL", "MongoDB",
                "Redis", "Kubernetes", "CI/CD", "Jenkins", "HTML5", "CSS3", "SASS",
                "Java", "Spring Boot", "C++", "Go", "Rust", "TensorFlow", "PyTorch",
                "Data Analysis", "Machine Learning", "Communication", "Leadership",
                "Project Management", "Agile", "Scrum", "UI/UX Design", "Figma"
            ]
            found = [s for s in mock_skills if s.lower() in prompt.lower()]
            return {"skills": found if found else ["Communication", "Critical Thinking"]}

        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt},
                ],
                model=self.model,
                response_format={"type": "json_object"},
                temperature=0.1,
                max_tokens=1024,
            )
            
            content = chat_completion.choices[0].message.content
            print(f"DEBUG: Groq raw response: {content[:200]}...")
            
            # Robust JSON extraction
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            
            try:
                return json.loads(content)
            except json.JSONDecodeError:
                # If it's still not valid JSON, try to find the first '{' and last '}'
                start = content.find('{')
                end = content.rfind('}')
                if start != -1 and end != -1:
                    return json.loads(content[start:end+1])
                raise
        except Exception as e:
            logger.error(f"Groq API call failed: {e}")
            raise

    def create_transcription(self, file_path: str):
        self._ensure_client()
        if not self.client:
            logger.warning("Groq client not available for transcription")
            return "Transcription service currently unavailable (API key missing)."
        
        try:
            with open(file_path, "rb") as file:
                transcription = self.client.audio.transcriptions.create(
                    file=(file_path, file.read()),
                    model="distil-whisper-large-v3-en",
                    response_format="verbose_json",
                )
                return transcription.text
        except Exception as e:
            logger.error(f"Groq transcription failed: {e}")
            return f"Error during transcription: {str(e)}"

groq_service = GroqService()
