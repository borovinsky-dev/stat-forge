from uuid import UUID

from fastapi import APIRouter, Depends

from app.api.dependencies.auth import get_current_user
from app.api.dependencies.game import get_game_service
from app.schemas.game import PlayerGamesResponse
from app.schemas.user import UserResponse
from app.services.game.game_service import GameService

router = APIRouter(prefix="/players/{player_id}/games", tags=["Game statistics"])


@router.get("/", response_model=PlayerGamesResponse)
async def get_player_statistics(
    player_id: UUID,
    current_user: UserResponse = Depends(get_current_user),
    game_service: GameService = Depends(get_game_service),
) -> PlayerGamesResponse:
    return await game_service.get_player_statistics(current_user.id, player_id)


@router.post(
    "/sync",
    response_model=PlayerGamesResponse,
)
async def sync_player_statistics(
    player_id: UUID,
    current_user: UserResponse = Depends(get_current_user),
    game_service: GameService = Depends(get_game_service),
) -> PlayerGamesResponse:
    return await game_service.sync_player_statistics(current_user.id, player_id)
