from app.models.core.steam_player import SteamPlayer
from ..base_repository import BaseRepo


from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


class SteamPlayerRepo(BaseRepo[SteamPlayer]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, SteamPlayer)

    async def get_by_steam_id(self, steam_id: str) -> SteamPlayer | None:
        query = select(SteamPlayer).where(SteamPlayer.steam_id == steam_id)
        result = await self.session.execute(query)
        return result.scalar_one_or_none()
