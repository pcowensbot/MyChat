"""
Application configuration management
"""
from pydantic_settings import BaseSettings
from typing import List
import secrets


class Settings(BaseSettings):
    """Application settings"""

    # Server
    DOMAIN: str = "mychat.pcowens.com"
    MAX_USERS: int = 500
    SECRET_KEY: str = secrets.token_hex(32)

    # Database
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_NAME: str = "mychat"
    DB_USER: str = "mychat"
    DB_PASS: str = ""

    # Redis
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0

    # Admin
    ADMIN_EMAIL: str = "admin@example.com"

    # Session
    SESSION_TIMEOUT_HOURS: int = 168  # 7 days

    # Limits
    MAX_MESSAGE_SIZE: int = 10485760  # 10MB
    MAX_FILE_SIZE: int = 52428800  # 50MB

    # Federation
    FEDERATION_ENABLED: bool = True

    # Registration
    REGISTRATION_OPEN: bool = True

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "https://mychat.pcowens.com"]

    # API
    API_V1_PREFIX: str = "/api"

    # WebSocket
    WS_HEARTBEAT_INTERVAL: int = 30  # seconds

    @property
    def DATABASE_URL(self) -> str:
        """Construct database URL"""
        return f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASS}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    @property
    def REDIS_URL(self) -> str:
        """Construct Redis URL"""
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
