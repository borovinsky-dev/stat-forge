from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security.password import password_hash
from app.repositories.user.user_repository import UserRepo
from app.schemas.user import UserCreate, UserLogin
from app.services.user.session_service import SessionService
from app.services.user.user_service import UserService
from app.models.core.user import User
from app.exceptions import InvalidCredentialsError, InactiveUserError


class AuthService:
    """Registration and credential-based authentication."""

    def __init__(self, session: AsyncSession):
        self.session = session
        self.user_repo = UserRepo(session)
        self.user_service = UserService(session)
        self.session_service = SessionService(session)
        self.password_hasher = password_hash

    async def register(
        self,
        payload: UserCreate,
        user_agent: str | None = None,
    ) -> tuple[User, str]:
        try:
            user = await self.user_service.create_user(payload)
            token = await self.session_service.create_session(user, user_agent)
            await self.session.commit()
            return user, token
        except Exception:
            await self.session.rollback()
            raise

    async def login(
        self,
        payload: UserLogin,
        user_agent: str | None = None,
    ) -> tuple[User, str]:
        user = await self.user_repo.get_by_email(payload.email)
        if user is None:
            raise InvalidCredentialsError()

        if not self.password_hasher.verify(payload.password, user.hashed_password):
            raise InvalidCredentialsError()

        if not user.is_active:
            raise InactiveUserError()

        try:
            token = await self.session_service.create_session(user, user_agent)
            await self.session.commit()
            return user, token
        except Exception:
            await self.session.rollback()
            raise
