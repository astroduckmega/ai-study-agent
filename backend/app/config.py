import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Study Agent"
    ENVIRONMENT: str = "development"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "super-secret-ai-study-agent-jwt-key-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # LLM Settings
    DEFAULT_LLM_PROVIDER: str = "gemini"  # gemini, groq, openrouter, ollama, openai
    DEFAULT_MODEL_NAME: str = "gemini-1.5-flash"
    GOOGLE_API_KEY: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None
    OPENROUTER_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    OLLAMA_BASE_URL: str = "http://localhost:11434"

    # MongoDB Settings
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "ai_study_agent"

    # Vector Store & Storage Settings
    CHROMA_PERSIST_DIR: str = "./data/chromadb"
    UPLOAD_DIR: str = "./data/uploads"
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    MAX_UPLOAD_SIZE_MB: int = 50

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "*"
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

# Ensure required local directories exist
os.makedirs(settings.CHROMA_PERSIST_DIR, exist_ok=True)
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
