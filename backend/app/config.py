import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Application configuration loaded from environment variables."""

    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    CORS_ORIGINS: list[str] = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
    APP_ENV: str = os.getenv("APP_ENV", "development")

    # JWT settings
    JWT_SECRET: str = os.getenv("JWT_SECRET", "crm-dev-secret-change-in-production-2024")
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_EXPIRE_MINUTES: int = int(os.getenv("JWT_ACCESS_EXPIRE_MINUTES", "60"))
    JWT_REFRESH_EXPIRE_MINUTES: int = int(os.getenv("JWT_REFRESH_EXPIRE_MINUTES", "10080"))  # 7 days

    @property
    def is_production(self) -> bool:
        return self.APP_ENV == "production"


settings = Settings()
