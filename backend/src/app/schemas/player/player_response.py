from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class PlayerResponse(BaseModel):
    id: UUID
    steam_id: str
    username: str
    avatar_url: str | None
    avatar_medium_url: str | None
    profile_url: str | None
    country_code: str | None
    community_visibility_state: int | None
    profile_state: int | None
    last_logoff: int | None
    is_active: bool
    is_tracked: bool
    last_fetched_at: datetime | None
