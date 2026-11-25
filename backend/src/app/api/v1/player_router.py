from uuid import UUID

from fastapi import APIRouter, Depends, status

from app.api.dependencies.auth import get_current_user
from app.api.dependencies.player import get_player_service
from app.models.core.user import User
from app.schemas.player import PlayerAddRequest, PlayerResponse, PlayerTrackingUpdate
from app.services.player.player_service import PlayerService

router = APIRouter(prefix="/players", tags=["Players"])


@router.get("/", response_model=list[PlayerResponse])
async def get_players(
    current_user: User = Depends(get_current_user),
    player_service: PlayerService = Depends(get_player_service),
) -> list[PlayerResponse]:
    return await player_service.get_players_for_user(current_user.id)


@router.post(
    "/add",
    response_model=PlayerResponse,
    status_code=status.HTTP_201_CREATED,
)
async def add_player(
    payload: PlayerAddRequest,
    current_user: User = Depends(get_current_user),
    player_service: PlayerService = Depends(get_player_service),
) -> PlayerResponse:
    return await player_service.add_player_for_user(
        current_user.id,
        payload.steam_profile,
    )


@router.get("/{player_id}", response_model=PlayerResponse)
async def get_player(
    player_id: UUID,
    current_user: User = Depends(get_current_user),
    player_service: PlayerService = Depends(get_player_service),
) -> PlayerResponse:
    return await player_service.get_player_for_user(current_user.id, player_id)


@router.patch("/{player_id}", response_model=PlayerResponse)
async def update_player_tracking(
    player_id: UUID,
    payload: PlayerTrackingUpdate,
    current_user: User = Depends(get_current_user),
    player_service: PlayerService = Depends(get_player_service),
) -> PlayerResponse:
    return await player_service.update_tracking(
        current_user.id,
        player_id,
        payload.is_tracked,
    )


@router.delete("/{player_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_player(
    player_id: UUID,
    current_user: User = Depends(get_current_user),
    player_service: PlayerService = Depends(get_player_service),
) -> None:
    await player_service.remove_player_for_user(current_user.id, player_id)


@router.post("/{player_id}/sync", response_model=PlayerResponse)
async def sync_player(
    player_id: UUID,
    current_user: User = Depends(get_current_user),
    player_service: PlayerService = Depends(get_player_service),
) -> PlayerResponse:
    return await player_service.sync_player_for_user(current_user.id, player_id)
