from datetime import datetime, timedelta, timezone
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.user.user_repository import UserRepo
from app.repositories.user.user_session_repository import UserSessionRepo

from app.core.security.password import password_hash
from app.core.security.session_manager import session_manager

from app.schemas.user import UserLogin, UserCreate
from app.services.user.user_service import UserService
from app.models.core.user_session import UserSession

from app.models.core.user import User


from app.core.config import settings

from app.exceptions import (
    InvalidCredentialsError,
    InvalidSessionError,
    InactiveUserError,
)


class AuthService:
    """Аутентификация и сессии"""

    def __init__(self, session: AsyncSession):
        self.session = session

        self.user_repo = UserRepo(session)
        self.user_session_repo = UserSessionRepo(session)

        self.user_service = UserService(session)

        self.password_hasher = password_hash
        self.session_manager = session_manager

    async def create_session(self, user: User) -> str:
        if not user.is_active:
            raise InactiveUserError()

        generated_token = self.session_manager.generate_token()
        generated_hash_token = self.session_manager.hash_token(generated_token)

        expires_at = datetime.now(timezone.utc) + timedelta(
            days=settings.session_expire_days
        )

        user_session = UserSession(
            user_id=user.id,
            token_hash=generated_hash_token,
            expires_at=expires_at,
        )

        await self.user_session_repo.create(user_session)

        return generated_token

    async def register(self, payload: UserCreate) -> tuple[User, str]:
        try:
            user = await self.user_service.create_user(payload)

            token = await self.create_session(user)

            await self.session.commit()

            return user, token

        except Exception:
            await self.session.rollback()
            raise

    async def login(self, payload: UserLogin) -> str:
        existed_user = await self.user_repo.get_by_email(payload.email)

        if existed_user is None:
            raise InvalidCredentialsError()

        is_verified_password = self.password_hasher.verify(
            payload.password,
            existed_user.hashed_password,
        )

        if not is_verified_password:
            raise InvalidCredentialsError()

        if not existed_user.is_active:
            raise InactiveUserError()

        try:
            token = await self.create_session(existed_user)

            await self.session.commit()

            return token

        except Exception:
            await self.session.rollback()
            raise

    async def get_current_user(self, token: str | None) -> User:
        if token is None:
            raise InvalidSessionError()

        hashed_token = self.session_manager.hash_token(token=token)
        user_session = await self.user_session_repo.get_by_token_hash(
            token_hash=hashed_token
        )
        if user_session is None:
            raise InvalidSessionError()
        if user_session.revoked_at is not None:
            raise InvalidSessionError()
        if user_session.expires_at <= datetime.now(timezone.utc):
            raise InvalidSessionError()

        user = await self.user_repo.get_by_id(user_session.user_id)
        if user is None:
            raise InvalidSessionError()

        if not user.is_active:
            raise InactiveUserError()
        return user

    async def logout(self, token: str | None) -> None:
        if token is None:
            raise InvalidSessionError()

        hashed_token = self.session_manager.hash_token(token=token)

        user_session = await self.user_session_repo.get_by_token_hash(
            token_hash=hashed_token
        )

        if user_session is None:
            raise InvalidSessionError()

        await self.user_session_repo.revoke(user_session)

    async def logout_all(self, user_id: UUID) -> int:
        revoked_sessions = await self.user_session_repo.revoke_all_by_user_id(
            user_id=user_id
        )

        return revoked_sessions

    async def get_active_sessions(self, user_id: UUID) -> list[UserSession]:
        sessions = await self.user_session_repo.get_active_by_user_id(user_id=user_id)

        return sessions
