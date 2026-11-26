from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.game.player_game import PlayerGame
from app.repositories.base_repository import BaseRepo


class PlayerGameRepo(BaseRepo[PlayerGame]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, PlayerGame)

    async def get_by_player_and_game(
        self, player_id: UUID, game_id: UUID
    ) -> PlayerGame | None:
        result = await self.session.execute(
            select(PlayerGame).where(
                PlayerGame.player_id == player_id,
                PlayerGame.game_id == game_id,
            )
        )
        return result.scalar_one_or_none()

    async def get_all_for_player(self, player_id: UUID) -> list[PlayerGame]:
        result = await self.session.execute(
            select(PlayerGame)
            .options(joinedload(PlayerGame.game))
            .where(PlayerGame.player_id == player_id)
            .order_by(PlayerGame.playtime_forever.desc())
        )
        return list(result.scalars().all())
