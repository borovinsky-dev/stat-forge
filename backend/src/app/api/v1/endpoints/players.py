from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status

from app.schemas import (
    PlayerCreate,
    PlayerUpdate,
    PlayerResponse,
    PlayerDeleteResponse,
)

from app.services import PlayerService
from app.api.dependencies import get_player_service
from app.exceptions.player import PlayerAlreadyExistsError, PlayerNotFoundError

router = APIRouter(prefix="/players", tags=["players"])


@router.get(
    "/",
    status_code=status.HTTP_200_OK,
    response_model=list[PlayerResponse],
)
async def get_players(
    player_service: PlayerService = Depends(get_player_service),
) -> list[PlayerResponse]:
    return await player_service.get_all_added_players()


@router.get(
    "/steam/{steam_id}", status_code=status.HTTP_200_OK, response_model=PlayerResponse
)
async def get_by_steam_id(
    steam_id: str, player_service: PlayerService = Depends(get_player_service)
) -> PlayerResponse:
    try:
        return await player_service.get_by_steam_id(steam_id)
    except PlayerNotFoundError as e:
        print(e)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)


@router.get(
    "/id/{id_player}", status_code=status.HTTP_200_OK, response_model=PlayerResponse
)
async def get_by_id_player(
    id_player: UUID, player_service: PlayerService = Depends(get_player_service)
) -> PlayerResponse:
    try:
        return await player_service.get_player_by_id(id_player)
    except PlayerNotFoundError as e:
        print(e)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)


@router.post(
    "/add",
    status_code=status.HTTP_201_CREATED,
    response_model=PlayerResponse,
)
async def add_player(
    payload: PlayerCreate, player_service: PlayerService = Depends(get_player_service)
) -> PlayerResponse:
    try:
        return await player_service.create_player(payload=payload)
    except PlayerAlreadyExistsError as e:
        print(e)
        raise HTTPException(status_code=status.HTTP_409_CONFLICT)


@router.patch(
    "/{player_id}",
    status_code=status.HTTP_200_OK,
    response_model=PlayerResponse,
)
async def update_player(
    player_id: UUID,
    payload: PlayerUpdate,
    player_service: PlayerService = Depends(get_player_service),
) -> PlayerResponse:
    try:
        return await player_service.update_player(
            player_id=player_id,
            payload=payload,
        )
    except PlayerNotFoundError as e:
        print(e)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)


@router.delete(
    "/{player_id}",
    status_code=status.HTTP_200_OK,
    response_model=PlayerDeleteResponse,
)
async def delete_player(
    player_id: UUID,
    player_service: PlayerService = Depends(get_player_service),
) -> PlayerDeleteResponse:
    try:
        return await player_service.delete_player(player_id=player_id)
    except PlayerNotFoundError as e:
        print(e)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
