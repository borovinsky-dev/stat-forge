from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.app.routers.players import router as players_router

app = FastAPI(
    title="Mock Steam API",
    description="Mock Steam API for StatForge development",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(players_router, prefix="/api/v1")


@app.get("/")
async def root():
    return {"message": "Mock Steam API is running"}
