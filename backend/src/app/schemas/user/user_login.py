from pydantic import BaseModel, Field, EmailStr, ConfigDict


class UserLogin(BaseModel):
    """Необходимые данные для входа"""

    email: EmailStr
    password: str = Field(..., min_length=8, max_length=16)
