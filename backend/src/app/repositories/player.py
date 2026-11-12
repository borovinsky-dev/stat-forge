from uuid import UUID, uuid4
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.player import Player


class PlayerRepo:
    def __init__(self, db_session: AsyncSession):
        self.db_session = db_session

    async def get_all(self) -> list[Player]:
        query = select(Player)
        result = await self.db_session.execute(query)
        return result.scalars().all()

    async def get_by_id(self, player_id: UUID) -> Player | None:
        return await self.db_session.get(Player, player_id)

    async def get_by_steam_id(self, steam_id: str) -> Player | None:
        query = select(Player).where(Player.steam_id == steam_id)
        result = await self.db_session.execute(query)
        return result.scalar_one_or_none()

    async def create(self, player_data: dict) -> Player | None:
        player = Player(**player_data)
        self.db_session.add(player)
        await self.db_session.commit()
        await self.db_session.refresh(player)
        return player

    # будет использоваться только для того, чтобы обновлять данные игрока, необязательные поля
    async def update(self, player_in_id: UUID, player_data: dict) -> Player | None:
        player: Player | None = await self.get_by_id(player_in_id)
        if player is None:
            return None

        for key, value in player_data.items():
            setattr(player, key, value)
        await self.db_session.commit()
        await self.db_session.refresh(player)
        return player

    async def delete(self, player_id: UUID) -> bool:
        player_by_id = await self.get_by_id(player_id)
        if player_by_id is None:
            return False
        await self.db_session.delete(player_by_id)
        await self.db_session.commit()
        return True
