from fastapi import APIRouter, Depends

from app.clients.steam.client import SteamClient
from app.api.steam import get_steam_client

router = APIRouter(prefix="/steamplayers", tags=["SteamPlayers"])


@router.get("/steam/{steam_id}")
async def get_steam_player(
    steam_id: str,
    steam_client: SteamClient = Depends(get_steam_client),
):
    player = await steam_client.get_player_summaries([steam_id])

    return player
