from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "sqlite:///./btc_portfolio.db"
    jwt_secret_key: str = "change-me-in-production"
    jwt_expires_minutes: int = 1440
    cors_origins: str = "http://localhost:5173,http://localhost:3000"
    coingecko_api_key: str = ""
    market_cache_ttl_seconds: int = 60

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()

