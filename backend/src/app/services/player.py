from app.exceptions.player import PlayerAlreadyExistsError, PlayerNotFoundError
from app.repositories import PlayerRepo
from app.models.player import Player
from app.schemas import PlayerUpdate, PlayerCreate, PlayerResponse, PlayerDeleteResponse
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID


class PlayerService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.player_repo = PlayerRepo(session)

    async def get_player_by_id(self, player_id: UUID) -> PlayerResponse | None:
        player = await self.player_repo.get_by_id(player_id)
        if player is None:
            raise PlayerNotFoundError(player_id)

        return PlayerResponse.model_validate(player)

    async def get_by_steam_id(self, player_steam_id: str) -> PlayerResponse | None:
        player = await self.player_repo.get_by_steam_id(steam_id=player_steam_id)
        if player is None:
            raise PlayerNotFoundError(player_steam_id)

        return PlayerResponse.model_validate(player)

    async def get_all_added_players(self) -> list[PlayerResponse]:
        players = await self.player_repo.get_all()

        return [PlayerResponse.model_validate(player) for player in players]

    async def create_player(self, payload: PlayerCreate) -> PlayerResponse:
        if (
            await self.player_repo.get_by_steam_id(steam_id=payload.steam_id)
            is not None
        ):
            raise PlayerAlreadyExistsError(payload.steam_id)
        player_from_orm: Player = await self.player_repo.create(payload.model_dump())
        return PlayerResponse.model_validate(player_from_orm)

    async def update_player(
        self, player_id: UUID, payload: PlayerUpdate
    ) -> PlayerResponse | None:
        new_player = await self.player_repo.update(
            player_in_id=player_id,
            player_data=payload.model_dump(exclude_unset=True),
        )
        if new_player is None:
            raise PlayerNotFoundError(player_id=player_id)
        return PlayerResponse.model_validate(new_player)

    async def delete_player(self, player_id: UUID) -> PlayerDeleteResponse:
        is_deleted = await self.player_repo.delete(player_id=player_id)

        if not is_deleted:
            raise PlayerNotFoundError(player_id=player_id)

        return PlayerDeleteResponse(
            message="Player successfully deleted",
            success=True,
        )
