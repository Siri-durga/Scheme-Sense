from pydantic_settings import BaseSettings
from typing import Optional, List


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://schemesense:schemesense123@localhost:5432/schemesense"
    REDIS_URL: str = "redis://localhost:6379"
    SECRET_KEY: str = "supersecretkey-change-in-production-atleast32chars!!"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080
    OPENAI_API_KEY: Optional[str] = None
    QDRANT_URL: str = "http://localhost:6333"
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: str = "http://localhost:3000"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
