from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security.password import password_hash
from app.repositories.user.user_repository import UserRepo
from app.schemas.user import UserCreate, UserLogin
from app.services.user.session_service import SessionService
from app.services.user.user_service import UserService
from app.exceptions import InvalidCredentialsError, InactiveUserError
from app.schemas.user import AuthResponse, UserResponse


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
    ) -> AuthResponse:
        try:
            user = await self.user_service.create_user(payload)
            session_token = await self.session_service.create_session(user, user_agent)
            await self.session.commit()
            return AuthResponse(user=user, session_token=session_token.token)
        except Exception:
            await self.session.rollback()
            raise

    async def login(
        self,
        payload: UserLogin,
        user_agent: str | None = None,
    ) -> AuthResponse:
        user = await self.user_repo.get_by_email(payload.email)
        if user is None:
            raise InvalidCredentialsError()

        if not self.password_hasher.verify(payload.password, user.hashed_password):
            raise InvalidCredentialsError()

        if not user.is_active:
            raise InactiveUserError()

        try:
            user_response = UserResponse.model_validate(user)
            session_token = await self.session_service.create_session(
                user_response, user_agent
            )
            await self.session.commit()
            return AuthResponse(user=user_response, session_token=session_token.token)
        except Exception:
            await self.session.rollback()
            raise
