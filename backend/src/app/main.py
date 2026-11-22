from contextlib import asynccontextmanager


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints.players import router as players_router
from app.api.v1.endpoints.steam_players import router as steam_player_router
from app.db.db_connection import engine
from app.models import Base

from app.core.config import settings
from app.clients.steam.client import SteamClient


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    app.state.steam_client = SteamClient(settings.steam_api_key)

    yield

    await app.state.steam_client.close()
    await engine.dispose()


app = FastAPI(title="StatForge", lifespan=lifespan)

app.include_router(
    players_router,
    prefix="/api/v1",
)

app.include_router(
    steam_player_router,
    prefix="/api/v1",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health_check_uvicorn():
    return {"server": "working"}


for route in app.routes:
    methods = getattr(route, "methods", None)
    path = getattr(route, "path", None)

    if path:
        print(f"{methods} -> {path}")
