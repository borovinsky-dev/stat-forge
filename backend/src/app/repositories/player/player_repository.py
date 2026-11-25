from app.models.core.player import Player
from ..base_repository import BaseRepo


from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


class PlayerRepo(BaseRepo[Player]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, Player)

    async def get_by_steam_id(self, steam_id: str) -> Player | None:
        query = select(Player).where(Player.steam_id == steam_id)
        result = await self.session.execute(query)
        return result.scalar_one_or_none()
