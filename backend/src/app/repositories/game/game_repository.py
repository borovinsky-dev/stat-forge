from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.game.game import Game
from app.repositories.base_repository import BaseRepo


class GameRepo(BaseRepo[Game]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, Game)

    async def get_by_steam_app_id(self, steam_app_id: int) -> Game | None:
        result = await self.session.execute(
            select(Game).where(Game.steam_app_id == steam_app_id)
        )
        return result.scalar_one_or_none()
