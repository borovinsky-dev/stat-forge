from pydantic import BaseModel, EmailStr, Field


class UserUpdate(BaseModel):
    """Изменение пользователем данных"""

    username: str | None = Field(
        default=None,
        min_length=5,
        max_length=50,
    )
    email: EmailStr | None = None
