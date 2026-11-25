from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from httpx import AsyncClient
from app.db.db_connection import engine
from app.models import Base
from app.exceptions import (
    InactiveUserError,
    InvalidCredentialsError,
    InvalidSessionError,
    SessionExpiredError,
    SessionRevokedError,
    UserAlreadyExistsError,
)
from app.exceptions.base import AppException
from app.exceptions.player import (
    InvalidSteamProfileError,
    SteamApiUnavailableError,
    SteamPlayerNotFoundError,
    TrackedPlayerNotFoundError,
)


from app.api.v1.account_router import router as account_router
from app.api.v1.auth_router import router as auth_router
from app.api.v1.session_router import router as session_router
from app.api.v1.player_router import router as player_router
from app.external.steam import SteamClient


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.steam_client = SteamClient(AsyncClient(timeout=10))
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        yield
    finally:
        await app.state.steam_client.close()
        await engine.dispose()


app = FastAPI(title="StatForge", lifespan=lifespan)


@app.exception_handler(AppException)
async def handle_app_exception(_request: Request, exc: AppException) -> JSONResponse:
    if isinstance(exc, InvalidCredentialsError):
        status_code, detail = 401, "Invalid email or password."
    elif isinstance(
        exc, (InvalidSessionError, SessionExpiredError, SessionRevokedError)
    ):
        status_code, detail = 401, "Your session is invalid or has expired."
    elif isinstance(exc, InactiveUserError):
        status_code, detail = 403, "This account is inactive."
    elif isinstance(exc, UserAlreadyExistsError):
        status_code, detail = 409, str(exc)
    elif isinstance(exc, InvalidSteamProfileError):
        status_code, detail = 422, "Enter a valid Steam ID or Steam profile URL."
    elif isinstance(exc, (SteamPlayerNotFoundError, TrackedPlayerNotFoundError)):
        status_code, detail = 404, "The Steam profile or tracked player was not found."
    elif isinstance(exc, SteamApiUnavailableError):
        status_code, detail = 502, "Steam is temporarily unavailable. Try again later."
    else:
        status_code, detail = 400, str(exc) or "The request could not be completed."

    return JSONResponse(status_code=status_code, content={"detail": detail})


app.include_router(auth_router, prefix="/api/v1")
app.include_router(account_router, prefix="/api/v1")
app.include_router(session_router, prefix="/api/v1")
app.include_router(player_router, prefix="/api/v1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health_check_uvicorn():
    return {"server": "working"}
