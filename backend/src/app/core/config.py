from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

env_path = Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    app_name: str = "stat-forge"
    db_url: str
    db_user: str
    db_pass: str

    model_config = SettingsConfigDict(
        env_file=env_path / ".env", env_file_encoding="utf-8"
    )


settings = Settings()

if __name__ == "__main__":
    print("Проверка пути")
    print(env_path)
    print("Проверка settings:", settings)
