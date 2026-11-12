from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.db_connection import get_async_connection
from app.services.player import PlayerService


def get_player_service(
    session: AsyncSession = Depends(get_async_connection),
) -> PlayerService:
    """Функция для инъекции зависимости PlayerService."""
    return PlayerService(session)
