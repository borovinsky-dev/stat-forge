from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.base_repository import BaseRepo
from app.models.core.user_session import UserSession


class UserSessionRepo(BaseRepo[UserSession]):
    # crud уже доступны в базовом классе BaseRepo
    def __init__(self, session: AsyncSession):
        super().__init__(session, UserSession)

    async def get_by_token_hash(
        self,
        token_hash: str,
    ) -> UserSession | None:
        query = select(UserSession).where(UserSession.token_hash == token_hash)
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    async def get_active_by_user_id(
        self,
        user_id: UUID,
    ) -> list[UserSession]:
        now = datetime.now(timezone.utc)
        query = (
            select(UserSession)
            .where(
                UserSession.user_id == user_id,
                UserSession.revoked_at.is_(None),
                UserSession.expires_at > now,
            )
            .order_by(UserSession.created_at.desc())
        )
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def revoke(self, user_session: UserSession) -> None:

        if user_session.revoked_at is None:
            user_session.revoked_at = datetime.now(timezone.utc)
            await self.session.flush()

    async def revoke_all_by_user_id(
        self,
        user_id: UUID,
    ) -> int:
        now = datetime.now(timezone.utc)
        query = (
            update(UserSession)
            .where(
                UserSession.user_id == user_id,
                UserSession.revoked_at.is_(None),
                UserSession.expires_at > now,
            )
            .values(revoked_at=now)
        )
        result = await self.session.execute(query)
        return result.rowcount or 0

    async def update_last_used(
        self,
        user_session: UserSession,
    ) -> None:
        user_session.last_used_at = datetime.now(timezone.utc)
        await self.session.flush()

    async def revoke_by_id_for_user(
        self,
        session_id: UUID,
        user_id: UUID,
    ) -> bool:
        now = datetime.now(timezone.utc)

        query = (
            update(UserSession)
            .where(
                UserSession.id == session_id,
                UserSession.user_id == user_id,
                UserSession.revoked_at.is_(None),
                UserSession.expires_at > now,
            )
            .values(revoked_at=now)
        )

        result = await self.session.execute(query)
        return result.rowcount == 1
