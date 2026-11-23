from pydantic import BaseModel, Field, EmailStr


class UserCreate(BaseModel):
    """Необходимые данные для регистрации"""

    username: str = Field(..., min_length=5, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=16)
