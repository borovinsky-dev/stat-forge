from fastapi import Request

from app.clients.steam.client import SteamClient


def get_steam_client(request: Request) -> SteamClient:
    return request.app.state.steam_client
