from fastapi import APIRouter, Depends, status

from app.api.dependencies.auth import get_current_user, get_user_service
from app.models.core.user import User
from app.schemas.user import UserPasswordChange, UserResponse, UserUpdate
from app.services.user.user_service import UserService

router = APIRouter(prefix="/auth", tags=["Account"])


@router.get("/me", response_model=UserResponse, status_code=status.HTTP_200_OK)
async def get_me(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@router.patch("/me", response_model=UserResponse, status_code=status.HTTP_200_OK)
async def update_me(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
) -> User:
    return await user_service.update_profile(current_user.id, payload)


@router.patch("/password", status_code=status.HTTP_204_NO_CONTENT)
async def change_password(
    payload: UserPasswordChange,
    current_user: User = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
) -> None:
    await user_service.change_password(
        current_user.id,
        payload.current_password,
        payload.new_password,
    )
