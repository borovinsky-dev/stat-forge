from pydantic import BaseModel


class TokenResponse(BaseModel):
    """Ответ с сервера на клиент для сессии пользователя"""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
