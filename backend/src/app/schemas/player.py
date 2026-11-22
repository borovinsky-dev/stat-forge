from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID


class PlayerCreate(BaseModel):
    steam_id: str = Field(..., min_length=17, max_length=17)
    username: str = Field(..., min_length=1, max_length=50)
    is_tracked: bool = Field(default=False)
    avatar_url: str | None = None
    profile_url: str | None = None
    country_code: str | None = Field(default=None, min_length=2, max_length=2)


class PlayerUpdate(BaseModel):
    is_tracked: bool | None = None
    avatar_url: str | None = None
    profile_url: str | None = None
    country_code: str | None = Field(default=None, min_length=2, max_length=2)


class PlayerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    steam_id: str
    username: str
    avatar_url: str | None
    profile_url: str | None
    country_code: str | None
    is_tracked: bool


class PlayerDeleteResponse(BaseModel):
    message: str
    success: bool
