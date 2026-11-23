from app.models.core.user import User
from ..base_repository import BaseRepo
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


class UserRepo(BaseRepo[User]):
    def __init__(self, async_session: AsyncSession) -> None:
        super().__init__(async_session, User)

    async def get_by_email(self, email: str) -> User | None:
        query = select(User).where(User.email == email)

        result = await self.session.execute(query)

        return result.scalar_one_or_none()

    async def get_by_username(self, username: str) -> User | None:
        query = select(User).where(User.username == username)

        result = await self.session.execute(query)

        return result.scalar_one_or_none()

    async def get_active_user(self, user_id: UUID) -> User | None:
        query = select(User).where(
            User.id == user_id,
            User.is_active.is_(True),
        )

        result = await self.session.execute(query)

        return result.scalar_one_or_none()
