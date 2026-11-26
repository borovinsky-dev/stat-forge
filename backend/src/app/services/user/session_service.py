from datetime import datetime, timedelta, timezone
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security.session_manager import session_manager
from app.exceptions import InactiveUserError, InvalidSessionError
from app.models.core.user_session import UserSession
from app.repositories.user.user_repository import UserRepo
from app.repositories.user.user_session_repository import UserSessionRepo
from app.schemas.session import SessionResponse, SessionRevocationResponse
from app.schemas.session.session_token_response import SessionTokenResponse
from app.schemas.user.user_response import UserResponse
from app.schemas.common import CountResponse, OperationResponse


class SessionService:
    """Create, validate, inspect, and revoke user sessions."""

    def __init__(self, session: AsyncSession):
        self.session = session
        self.user_repo = UserRepo(session)
        self.user_session_repo = UserSessionRepo(session)
        self.session_manager = session_manager

    async def create_session(
        self, user: UserResponse, user_agent: str | None
    ) -> SessionTokenResponse:
        if not user.is_active:
            raise InactiveUserError()

        token = self.session_manager.generate_token()
        now = datetime.now(timezone.utc)
        user_session = UserSession(
            user_id=user.id,
            token_hash=self.session_manager.hash_token(token),
            expires_at=now + timedelta(days=settings.session_expire_days),
            last_used_at=now,
            user_agent=user_agent[:512] if user_agent else None,
        )
        await self.user_session_repo.create(user_session)
        return SessionTokenResponse(token=token)

    async def _get_active_session(self, token: str | None) -> UserSession:
        if token is None:
            raise InvalidSessionError()

        token_hash = self.session_manager.hash_token(token)
        user_session = await self.user_session_repo.get_by_token_hash(token_hash)
        if (
            user_session is None
            or user_session.revoked_at is not None
            or user_session.expires_at <= datetime.now(timezone.utc)
        ):
            raise InvalidSessionError()
        return user_session

    async def get_current_user(self, token: str | None) -> UserResponse:
        user_session = await self._get_active_session(token)
        user = await self.user_repo.get_by_id(user_session.user_id)
        if user is None:
            raise InvalidSessionError()
        if not user.is_active:
            raise InactiveUserError()

        try:
            await self.user_session_repo.update_last_used(user_session)
            await self.session.commit()
        except Exception:
            await self.session.rollback()
            raise
        return UserResponse.model_validate(user)

    async def get_active_sessions(
        self,
        user_id: UUID,
        current_token: str | None,
    ) -> list[SessionResponse]:
        if current_token is None:
            raise InvalidSessionError()

        current_hash = self.session_manager.hash_token(current_token)
        sessions = await self.user_session_repo.get_active_by_user_id(user_id)

        return [
            SessionResponse(
                id=user_session.id,
                created_at=user_session.created_at,
                last_used_at=user_session.last_used_at,
                expires_at=user_session.expires_at,
                user_agent=user_session.user_agent,
                is_current=user_session.token_hash == current_hash,
            )
            for user_session in sessions
        ]

    async def revoke_session_for_user(
        self,
        session_id: UUID,
        user_id: UUID,
        current_token: str | None,
    ) -> SessionRevocationResponse:
        current_session = await self._get_active_session(current_token)
        is_current = current_session.id == session_id

        try:
            revoked = await self.user_session_repo.revoke_by_id_for_user(
                session_id=session_id,
                user_id=user_id,
            )
            if not revoked:
                await self.session.rollback()
                return SessionRevocationResponse(
                    session_id=session_id,
                    found=False,
                    revoked=False,
                    is_current=False,
                )
            await self.session.commit()
            return SessionRevocationResponse(
                session_id=session_id,
                found=True,
                revoked=True,
                is_current=is_current,
            )
        except Exception:
            await self.session.rollback()
            raise

    async def logout(self, token: str | None) -> OperationResponse:
        user_session = await self._get_active_session(token)
        try:
            await self.user_session_repo.revoke(user_session)
            await self.session.commit()
            return OperationResponse()
        except Exception:
            await self.session.rollback()
            raise

    async def logout_all(self, user_id: UUID) -> CountResponse:
        try:
            revoked_count = await self.user_session_repo.revoke_all_by_user_id(user_id)
            await self.session.commit()
            return CountResponse(count=revoked_count)
        except Exception:
            await self.session.rollback()
            raise
