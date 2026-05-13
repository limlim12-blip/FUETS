from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy import create_engine
import psycopg
import secrets


class Config(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )
    API_V1_STR: str = "/api/v1"
    APP_NAME: str = "fuet"
    SECRET_KEY: str = secrets.token_urlsafe(32)
    debug: bool = False

    # db
    DB_USER: str
    DB_PASSWORD: str
    DB_HOST: str = "db"
    DB_PORT: int = 5432
    DB_NAME: str

    # R2
    R2_BUCKET_NAME: str = ""
    R2_ACCESS_KEY: str = ""
    R2_SECRET_KEY: str = ""
    R2_ENDPOINT_URL: str = ""

    # groq not grok
    GROQ_API_KEY: str = ""
    NEON_DB_URL: str = ""
    QDRANT_API_KEY: str = ""

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


config = Config()  # type: ignore
