from pydantic import BaseModel, Field


class PlayerAddRequest(BaseModel):
    steam_profile: str = Field(min_length=1, max_length=500)


class PlayerTrackingUpdate(BaseModel):
    is_tracked: bool
