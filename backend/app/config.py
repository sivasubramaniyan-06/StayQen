from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "STAYQEN Shared Project Memory"
    API_V1_STR: str = "/api"
    ENVIRONMENT: str = "development"
    
    # FalkorDB settings
    FALKORDB_HOST: str = "localhost"
    FALKORDB_PORT: int = 6380
    FALKORDB_PASSWORD: str = ""
    FALKORDB_GRAPH: str = "stayqen_memory"
    
    # Gemini AI API Key
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-3.8-flash"
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://stayqen.vercel.app"
    ]
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
