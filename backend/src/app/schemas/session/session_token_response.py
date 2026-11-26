from pydantic import BaseModel


class SessionTokenResponse(BaseModel):
    token: str
