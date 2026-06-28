from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy import create_engine
import secrets
from pathlib import Path


class Config(BaseSettings):
    model_config = SettingsConfigDict(
        env_file="../.env",
        env_file_encoding="utf-8",
        extra="ignore",
    )
    API_V1_STR: str = "/api/v1"
    APP_NAME: str = "fuet"
    SECRET_KEY: str = secrets.token_urlsafe(32)
    debug: bool = False

    # db
    DB_USER: str = ""
    DB_PASSWORD: str = ""
    DB_HOST: str = "db"
    DB_PORT: int = 5432
    DB_NAME: str = ""

    # groq not grok
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8
    EMAIL_RESET_TOKEN_EXPIRE_HOURS: int = 60 * 24 * 8
    GROQ_API_KEY: str = ""
    NEON_DB_URL: str = ""
    QDRANT_URL: str = ""
    QDRANT_API_KEY: str = ""
    R2_ACCOUNT_ID: str = ""
    R2_ACCESS_KEY: str = ""
    R2_SECRET_KEY: str = ""
    R2_TOKEN: str = ""
    GOOGLE_API_KEY: str = ""
    ENVIRONMENT: str = ""
    RABBITMQ_URL: str = "amqp://guest:guest@rabbitmq:5672/"

    @property
    def DB_URL(self) -> str:
        try:
            test_engine = create_engine(self.NEON_DB_URL, echo=False)
            with test_engine.connect():
                print("NEON connection established")
                return self.NEON_DB_URL
        except Exception:
            print("Connection failed, fall to local db")
            return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    @property
    def R2_URL(self) -> str:
        if not self.R2_ACCOUNT_ID:
            return ""
        return f"https://{self.R2_ACCOUNT_ID}.r2.cloudflarestorage.com"


config = Config()  # type: ignore
