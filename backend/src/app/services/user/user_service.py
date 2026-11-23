from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.user.user_repository import UserRepo
from app.core.security.password import password_hash

from app.schemas.user import UserCreate
from app.models.core.user import User

from app.exceptions import UserAlreadyExistsError


class UserService:
    def __init__(self, session: AsyncSession):
        self.user_repo = UserRepo(session)
        self.password_hasher = password_hash

    async def create_user(self, payload: UserCreate) -> User:
        existed_user = await self.user_repo.get_by_email(payload.email)

        if existed_user is not None:
            raise UserAlreadyExistsError(email=payload.email)

        hashed_password = self.password_hasher.hash(payload.password)

        user = User(
            username=payload.username,
            email=payload.email,
            hashed_password=hashed_password,
        )

        await self.user_repo.create(user)

        return user
