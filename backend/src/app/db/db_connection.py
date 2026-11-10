from sqlalchemy.ext.asyncio import (
    create_async_engine,
    async_sessionmaker,
    AsyncSession,
    AsyncEngine,
)

from app.core.config import settings

engine: AsyncEngine = create_async_engine(
    settings.db_url,
    echo=True,
    pool_pre_ping=True,
)

# фабрика сессий
async_session_factory = async_sessionmaker(
    bind=engine, class_=AsyncSession, expire_on_commit=False
)


async def get_async_connection():
    async_session = async_session_factory()
    try:
        yield async_session
    finally:
        await async_session.close()
