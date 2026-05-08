import os

class Config:
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
    
    # Platform specific defaults
    PLATFORM_NAME = "Plaksha University Talent Search"
    
settings = Config()
