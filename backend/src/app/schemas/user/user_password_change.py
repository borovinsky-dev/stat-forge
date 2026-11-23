from pydantic import BaseModel, Field


class UserPasswordChange(BaseModel):
    """Отдельаная реализация изменения пароля"""

    current_password: str
    new_password: str = Field(
        min_length=8,
        max_length=16,
    )
