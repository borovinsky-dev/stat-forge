from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.db_connection import get_async_connection
from app.services.user.auth_service import AuthService


async def get_auth_service(
    session: AsyncSession = Depends(get_async_connection),
) -> AuthService:
    return AuthService(session)
