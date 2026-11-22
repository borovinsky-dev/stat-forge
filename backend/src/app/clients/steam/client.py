# Используется httpx для того, чтобы могли обратиться за информацией в виде json
#
from httpx import AsyncClient
from app.core.config import settings
from app.schemas.steam.player import (
    SteamPlayer,
    SteamPlayerSummariesResponse,
)

# import asyncio


class SteamClient:
    """Асинхронный HTTP-клиент на базе HTTPX."""

    base_url = "https://api.steampowered.com"

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.client = AsyncClient(base_url=self.base_url)

    async def get_player_summaries(self, steam_ids: list[str]) -> list[SteamPlayer]:
        if not steam_ids:
            raise ValueError("Steam IDs list cannot be empty")

        if len(steam_ids) > 100:
            raise ValueError("Maximum 100 Steam IDs per request")

        response = await self.client.get(
            "/ISteamUser/GetPlayerSummaries/v2/",
            params={
                "key": self.api_key,
                "steamids": ",".join(steam_ids),
            },
        )

        response.raise_for_status()

        data = response.json()

        steam_response = SteamPlayerSummariesResponse.model_validate(data)

        return steam_response.response.players

    async def close(self) -> None:
        await self.client.aclose()


# async def main():
#     steam_client = SteamClient(settings.steam_api_key)

#     try:
#         players = await steam_client.get_player_summaries(["76561198124982486"])

#         print(players)

#     except Exception as exc:
#         print(type(exc).__name__, exc)

#     finally:
#         await steam_client.close()


# if __name__ == "__main__":
#     asyncio.run(main())
