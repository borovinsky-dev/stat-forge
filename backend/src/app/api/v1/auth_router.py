from fastapi import APIRouter, Depends, Request, Response, status

from app.api.dependencies.auth import get_auth_service
from app.api.session_cookies import set_session_cookie
from app.models.core.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.services.user.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register(
    payload: UserCreate,
    response: Response,
    request: Request,
    auth_service: AuthService = Depends(get_auth_service),
) -> User:
    user_agent = request.headers.get("User-Agent")
    user, token = await auth_service.register(payload, user_agent)
    set_session_cookie(response, token)
    return user


@router.post(
    "/login",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
)
async def login(
    payload: UserLogin,
    response: Response,
    request: Request,
    auth_service: AuthService = Depends(get_auth_service),
) -> User:
    user_agent = request.headers.get("User-Agent")
    user, token = await auth_service.login(payload, user_agent)
    set_session_cookie(response, token)
    return user
