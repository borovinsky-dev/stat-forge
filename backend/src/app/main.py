from contextlib import asynccontextmanager


from fastapi import FastAPI

from app.api.v1.endpoints.players import router as players_router
from app.db.db_connection import engine
from app.models import Base


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield

    await engine.dispose()


app = FastAPI(title="StatForge", lifespan=lifespan)
app.include_router(
    players_router,
    prefix="/api/v1",
)


@app.get("/")
def health_check_uvicorn():
    return {"server": "working"}
