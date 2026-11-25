from typing import Any

from httpx import AsyncClient

from app.core.config import settings


class SteamClient:
    base_url = "https://api.steampowered.com"

    def __init__(self, async_client: AsyncClient):
        self.async_client = async_client
        self.api_key = settings.steam_api_key

    async def get_player_summary(self, steam_id: str) -> dict[str, Any] | None:
        response = await self.async_client.get(
            f"{self.base_url}/ISteamUser/GetPlayerSummaries/v2/",
            params={"key": self.api_key, "steamids": steam_id},
        )
        response.raise_for_status()
        players = response.json().get("response", {}).get("players", [])
        return players[0] if players else None

    async def resolve_vanity_url(self, vanity_name: str) -> str | None:
        response = await self.async_client.get(
            f"{self.base_url}/ISteamUser/ResolveVanityURL/v1/",
            params={"key": self.api_key, "vanityurl": vanity_name},
        )
        response.raise_for_status()
        result = response.json().get("response", {})
        if result.get("success") != 1:
            return None
        steam_id = result.get("steamid")
        return str(steam_id) if steam_id is not None else None

    async def close(self) -> None:
        await self.async_client.aclose()
