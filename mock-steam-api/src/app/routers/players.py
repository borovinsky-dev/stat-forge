from fastapi import APIRouter, HTTPException

from src.app.data.players import PLAYERS
from src.app.schemas.player import (
    SteamApiResponse,
    SteamPlayerSummary,
    SteamPlayersResponse,
)

router = APIRouter(prefix="/players", tags=["Players"])


@router.get("/{steam_id}", response_model=SteamApiResponse)
async def get_player_by_steam_id(steam_id: str) -> SteamApiResponse:
    player = PLAYERS.get(steam_id)

    if player is None:
        return SteamApiResponse(response=SteamPlayersResponse(players=[]))

    steam_player = SteamPlayerSummary(
        steamid=player["steam_id"],
        personaname=player["username"],
        avatarfull=player["avatar_url"],
        profileurl=player["profile_url"],
        loccountrycode=player["country_code"],
    )

    return SteamApiResponse(response=SteamPlayersResponse(players=[steam_player]))
