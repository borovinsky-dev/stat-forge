from fastapi import APIRouter, Depends, Response, status

from app.api.dependencies.auth import get_auth_service
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.services.user.auth_service import AuthService

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register(
    payload: UserCreate,
    response: Response,
    auth_service: AuthService = Depends(get_auth_service),
):
    user, token = await auth_service.register(payload)

    response.set_cookie(
        key="session",
        value=token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=30 * 24 * 60 * 60,
        path="/",
    )

    return user


@router.post(
    "/login",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
)
async def login(
    payload: UserLogin,
    response: Response,
    auth_service: AuthService = Depends(get_auth_service),
):
    token = await auth_service.login(payload)
    user = await auth_service.get_current_user(token)

    response.set_cookie(
        key="session",
        value=token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=30 * 24 * 60 * 60,
        path="/",
    )

    return user
