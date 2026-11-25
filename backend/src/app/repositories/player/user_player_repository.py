from uuid import UUID

from app.models.core.user_player import UserPlayer

from ..base_repository import BaseRepo


from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.core.player import Player


class UserPlayerRepo(BaseRepo[UserPlayer]):

    def __init__(self, session: AsyncSession):
        super().__init__(session, UserPlayer)

    async def get_by_user_and_player(
        self,
        user_id: UUID,
        player_id: UUID,
    ) -> UserPlayer | None:
        query = select(UserPlayer).where(
            UserPlayer.user_id == user_id,
            UserPlayer.player_id == player_id,
        )
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def get_all_for_user(self, user_id: UUID) -> list[UserPlayer]:
        query = (
            select(UserPlayer)
            .where(UserPlayer.user_id == user_id)
            .options(
                selectinload(UserPlayer.player).selectinload(Player.steam_player)
            )
        )
        result = await self.session.execute(query)
        return list(result.scalars().all())
