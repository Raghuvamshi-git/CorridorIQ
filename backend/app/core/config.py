import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "CorridorIQ — Agentic Transport Operations Intelligence Platform"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api"
    
    # Regional Configuration: Hyderabad, Telangana, India
    OPERATING_REGION: str = "Hyderabad, Telangana, India"
    DEFAULT_LATITUDE: float = 17.3850
    DEFAULT_LONGITUDE: float = 78.4867
    TIMEZONE: str = "Asia/Kolkata"
    CURRENCY: str = "INR (₹)"
    DATE_FORMAT: str = "DD-MM-YYYY"
    TIME_FORMAT: str = "24-hour"
    
    # Database Configuration (MySQL 8.0 default with automatic SQLite fallback)
    DATABASE_URL: str = "sqlite:///./corridoriq.db"
    MYSQL_URL: str = "mysql+pymysql://root:password@localhost:3306/corridoriq_db"
    USE_SQLITE_FALLBACK: bool = True
    
    # AI Agent Configuration
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"
    
    # Server & Security
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    DEBUG: bool = True
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]
    
    # Transit Operational Analytics Thresholds
    ON_TIME_THRESHOLD_MINS: float = 5.0
    BUNCHING_THRESHOLD_RATIO: float = 0.35
    LONG_HEADWAY_THRESHOLD_RATIO: float = 1.80
    OVERCROWDING_THRESHOLD_RATIO: float = 0.90

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(__file__), "..", "..", ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()

