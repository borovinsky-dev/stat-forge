from pydantic import BaseModel

from .user_response import UserResponse


class AuthResponse(BaseModel):
    user: UserResponse
    session_token: str
