from datetime import datetime, timezone
from uuid import UUID

from httpx import HTTPStatusError, RequestError
from sqlalchemy.ext.asyncio import AsyncSession

from app.exceptions.player import (
    SteamApiUnavailableError,
    TrackedPlayerNotFoundError,
)
from app.external.steam import SteamClient
from app.models.game.game import Game
from app.models.game.player_game import PlayerGame
from app.models.game.player_game_snapshot import PlayerGameSnapshot
from app.repositories.game import GameRepo, PlayerGameRepo
from app.repositories.player.player_repository import PlayerRepo
from app.repositories.player.user_player_repository import UserPlayerRepo
from app.schemas.game import PlayerGameResponse, PlayerGamesResponse


class GameService:
    """Fetch a player's Steam game statistics and persist current and historical data."""

    def __init__(self, session: AsyncSession, steam_client: SteamClient):
        self.session = session
        self.steam_client = steam_client
        self.player_repo = PlayerRepo(session)
        self.user_player_repo = UserPlayerRepo(session)
        self.game_repo = GameRepo(session)
        self.player_game_repo = PlayerGameRepo(session)

    async def sync_player_statistics(
        self, user_id: UUID, player_id: UUID
    ) -> PlayerGamesResponse:
        """Sync owned games and return the player's current game statistics.

        A None response means game details are private/unavailable. An empty list is
        a valid response and means the player currently has no games to report.
        """
        try:
            await self._ensure_player_tracked(user_id, player_id)
            player = await self.player_repo.get_by_id(player_id)
            if player is None:
                raise TrackedPlayerNotFoundError()

            games = await self.steam_client.get_owned_games(player.steam_id)
            if games is None:
                return PlayerGamesResponse(
                    games=[],
                    is_available=False,
                    message=(
                        "Steam did not share this player's game details. "
                        "Their statistics were skipped."
                    ),
                )

            fetched_at = datetime.now(timezone.utc)
            synced_player_games: list[PlayerGameResponse] = []
            for game_data in games:
                app_id = int(game_data["appid"])
                icon_hash = game_data.get("img_icon_url") or ""
                icon_url = (
                    f"https://media.steampowered.com/steamcommunity/public/images/"
                    f"apps/{app_id}/{icon_hash}.jpg"
                    if icon_hash
                    else ""
                )
                game = await self.game_repo.get_by_steam_app_id(app_id)
                if game is None:
                    game = await self.game_repo.create(
                        Game(
                            steam_app_id=app_id,
                            name=game_data.get("name") or f"App {app_id}",
                            img_icon_url=icon_url,
                            is_active=True,
                        )
                    )
                else:
                    updates = {"is_active": True}
                    if game_data.get("name"):
                        updates["name"] = game_data["name"]
                    if icon_url:
                        updates["img_icon_url"] = icon_url
                    await self.game_repo.update(game, updates)

                stats = {
                    "playtime_forever": game_data.get("playtime_forever", 0),
                    "playtime_2weeks": game_data.get("playtime_2weeks"),
                    "playtime_windows_forever": game_data.get(
                        "playtime_windows_forever"
                    ),
                    "rtime_last_played": game_data.get("rtime_last_played"),
                }
                player_game = await self.player_game_repo.get_by_player_and_game(
                    player.id, game.id
                )
                if player_game is None:
                    player_game = await self.player_game_repo.create(
                        PlayerGame(player_id=player.id, game_id=game.id, **stats)
                    )
                else:
                    await self.player_game_repo.update(
                        player_game,
                        {**stats, "last_fetched_at": fetched_at},
                    )

                if player_game.last_fetched_at is None:
                    await self.player_game_repo.update(
                        player_game, {"last_fetched_at": fetched_at}
                    )
                self.session.add(
                    PlayerGameSnapshot(
                        player_game_id=player_game.id,
                        **stats,
                        captured_at=fetched_at,
                    )
                )
                synced_player_games.append(
                    PlayerGameResponse(
                        id=player_game.id,
                        player_id=player.id,
                        game_id=game.id,
                        game=game,
                        **stats,
                        last_fetched_at=fetched_at,
                    )
                )

            await self.session.commit()
            return PlayerGamesResponse(
                games=synced_player_games,
                is_available=True,
                message=None,
            )
        except (HTTPStatusError, RequestError) as exc:
            await self.session.rollback()
            raise SteamApiUnavailableError() from exc
        except Exception:
            await self.session.rollback()
            raise

    async def get_player_statistics(
        self, user_id: UUID, player_id: UUID
    ) -> PlayerGamesResponse:
        await self._ensure_player_tracked(user_id, player_id)
        player = await self.player_repo.get_by_id(player_id)
        if player is None:
            raise TrackedPlayerNotFoundError()
        player_games = await self.player_game_repo.get_all_for_player(player_id)
        response_games = [PlayerGameResponse.model_validate(item) for item in player_games]
        return PlayerGamesResponse(
            games=response_games,
            is_available=True if response_games else None,
            message=None if response_games else "No game statistics have been synced yet.",
        )

    async def _ensure_player_tracked(self, user_id: UUID, player_id: UUID) -> None:
        relation = await self.user_player_repo.get_by_user_and_player(
            user_id, player_id
        )
        if relation is None:
            raise TrackedPlayerNotFoundError()
