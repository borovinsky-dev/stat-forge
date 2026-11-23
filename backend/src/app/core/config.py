from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

env_path = Path(__file__).resolve().parents[3]
env_file = env_path / ".env"


class Settings(BaseSettings):
    app_name: str = "stat-forge"

    db_url: str
    db_user: str
    db_pass: str

    steam_api_key: str

    session_expire_days: int

    model_config = SettingsConfigDict(
        env_file=env_file,
        env_file_encoding="utf-8",
    )


settings = Settings()
