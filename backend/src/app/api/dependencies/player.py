from fastapi import Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.db_connection import get_async_connection
from app.external.steam import SteamClient
from app.services.player.player_service import PlayerService


def get_steam_client(request: Request) -> SteamClient:
    return request.app.state.steam_client


async def get_player_service(
    session: AsyncSession = Depends(get_async_connection),
    steam_client: SteamClient = Depends(get_steam_client),
) -> PlayerService:
    return PlayerService(session, steam_client)
