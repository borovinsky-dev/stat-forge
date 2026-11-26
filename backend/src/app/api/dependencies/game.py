from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.player import get_steam_client
from app.db.db_connection import get_async_connection
from app.external.steam import SteamClient
from app.services.game.game_service import GameService


async def get_game_service(
    session: AsyncSession = Depends(get_async_connection),
    steam_client: SteamClient = Depends(get_steam_client),
) -> GameService:
    return GameService(session, steam_client)
