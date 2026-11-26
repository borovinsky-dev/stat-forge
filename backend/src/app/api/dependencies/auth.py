from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.db_connection import get_async_connection
from app.services.user.auth_service import AuthService
from app.services.user.session_service import SessionService
from app.services.user.user_service import UserService
from app.api.dependencies.session import get_session_cookie
from app.schemas.user import UserResponse


async def get_auth_service(
    session: AsyncSession = Depends(get_async_connection),
) -> AuthService:
    return AuthService(session)


async def get_session_service(
    session: AsyncSession = Depends(get_async_connection),
) -> SessionService:
    return SessionService(session)


async def get_user_service(
    session: AsyncSession = Depends(get_async_connection),
) -> UserService:
    return UserService(session)


async def get_current_user(
    access_token: str | None = Depends(get_session_cookie),
    session_service: SessionService = Depends(get_session_service),
) -> UserResponse:
    return await session_service.get_current_user(access_token)
