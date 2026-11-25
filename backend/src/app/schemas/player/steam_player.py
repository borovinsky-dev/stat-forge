from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class SteamPlayerFromSteam(BaseModel):
    model_config = ConfigDict(extra="ignore")

    steam_id: str = Field(alias="steamid")
    personaname: str

    profileurl: str | None = None

    avatar: str | None = None
    avatarmedium: str | None = None
    avatarfull: str | None = None

    communityvisibilitystate: int | None = None
    profilestate: int | None = None

    lastlogoff: int | None = None
    loccountrycode: str | None = None

    last_fetched_at: datetime | None = None
