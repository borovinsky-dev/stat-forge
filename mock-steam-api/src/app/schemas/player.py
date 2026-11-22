from pydantic import BaseModel, ConfigDict


class SteamPlayerSummary(BaseModel):
    model_config = ConfigDict(extra="forbid")

    steamid: str
    personaname: str
    avatarfull: str | None = None
    profileurl: str | None = None
    loccountrycode: str | None = None


class SteamPlayersResponse(BaseModel):
    players: list[SteamPlayerSummary]


class SteamApiResponse(BaseModel):
    response: SteamPlayersResponse
