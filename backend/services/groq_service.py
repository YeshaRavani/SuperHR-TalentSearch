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
            raise RuntimeError("Groq client is unavailable")

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
            return json.loads(content)
        except Exception as e:
            logger.error(f"Groq API call failed: {e}")
            raise

groq_service = GroqService()
