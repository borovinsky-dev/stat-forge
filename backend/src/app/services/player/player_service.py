import re
from datetime import datetime, timezone
from urllib.parse import unquote, urlsplit
from uuid import UUID

from httpx import HTTPStatusError, RequestError
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession

from app.exceptions.player import (
    InvalidSteamProfileError,
    SteamApiUnavailableError,
    SteamPlayerNotFoundError,
    TrackedPlayerNotFoundError,
)
from app.external.steam import SteamClient
from app.models.core.player import Player
from app.models.core.steam_player import SteamPlayer
from app.models.core.user_player import UserPlayer
from app.repositories.player.player_repository import PlayerRepo
from app.repositories.player.steam_player_repository import SteamPlayerRepo
from app.repositories.player.user_player_repository import UserPlayerRepo
from app.schemas.player import PlayerResponse, SteamPlayerFromSteam
from app.schemas.common import OperationResponse


class PlayerService:
    def __init__(self, session: AsyncSession, steam_client: SteamClient):
        self.session = session
        self.steam_client = steam_client
        self.steam_player_repo = SteamPlayerRepo(session)
        self.player_repo = PlayerRepo(session)
        self.user_player_repo = UserPlayerRepo(session)

    @staticmethod
    def _parse_steam_profile(value: str) -> tuple[str, str]:
        value = value.strip()
        if re.fullmatch(r"\d{17}", value):
            return "steam_id", value

        candidate = value if "://" in value else f"https://{value}"
        try:
            parsed = urlsplit(candidate)
        except ValueError as exc:
            raise InvalidSteamProfileError() from exc
        hostname = (parsed.hostname or "").lower()
        if hostname not in {"steamcommunity.com", "www.steamcommunity.com"}:
            raise InvalidSteamProfileError()

        parts = [unquote(part) for part in parsed.path.split("/") if part]
        if len(parts) == 2 and parts[0] == "profiles" and re.fullmatch(r"\d{17}", parts[1]):
            return "steam_id", parts[1]
        if len(parts) == 2 and parts[0] == "id" and parts[1]:
            return "vanity", parts[1]
        raise InvalidSteamProfileError()

    async def _resolve_steam_id(self, steam_profile: str) -> str:
        input_type, input_value = self._parse_steam_profile(steam_profile)
        if input_type == "steam_id":
            return input_value

        try:
            steam_id = await self.steam_client.resolve_vanity_url(input_value)
        except (HTTPStatusError, RequestError) as exc:
            raise SteamApiUnavailableError() from exc
        if steam_id is None:
            raise SteamPlayerNotFoundError()
        return steam_id

    async def _fetch_steam_player(self, steam_id: str) -> SteamPlayerFromSteam:
        try:
            payload = await self.steam_client.get_player_summary(steam_id)
        except (HTTPStatusError, RequestError) as exc:
            raise SteamApiUnavailableError() from exc
        if payload is None:
            raise SteamPlayerNotFoundError()

        try:
            return SteamPlayerFromSteam.model_validate(
                {**payload, "last_fetched_at": datetime.now(timezone.utc)}
            )
        except ValidationError as exc:
            raise SteamApiUnavailableError() from exc

    @staticmethod
    def _to_response(
        player: Player,
        steam_player: SteamPlayer,
        is_tracked: bool,
    ) -> PlayerResponse:
        return PlayerResponse(
            id=player.id,
            steam_id=steam_player.steam_id,
            username=steam_player.personaname,
            avatar_url=steam_player.avatarfull,
            avatar_medium_url=steam_player.avatarmedium,
            profile_url=steam_player.profileurl,
            country_code=steam_player.loccountrycode,
            community_visibility_state=steam_player.communityvisibilitystate,
            profile_state=steam_player.profilestate,
            last_logoff=steam_player.lastlogoff,
            is_active=player.is_active,
            is_tracked=is_tracked,
            last_fetched_at=steam_player.last_fetched_at,
        )

    async def get_player_for_user(
        self,
        user_id: UUID,
        player_id: UUID,
    ) -> PlayerResponse:
        user_player = await self.user_player_repo.get_by_user_and_player(
            user_id,
            player_id,
        )
        if user_player is None:
            raise TrackedPlayerNotFoundError()

        player = await self.player_repo.get_by_id(player_id)
        if player is None:
            raise TrackedPlayerNotFoundError()
        steam_player = await self.steam_player_repo.get_by_steam_id(player.steam_id)
        if steam_player is None:
            raise TrackedPlayerNotFoundError()
        return self._to_response(player, steam_player, user_player.is_tracked)

    async def add_player_for_user(
        self,
        user_id: UUID,
        steam_profile: str,
    ) -> PlayerResponse:
        try:
            steam_id = await self._resolve_steam_id(steam_profile)
            steam_player = await self.steam_player_repo.get_by_steam_id(steam_id)
            if steam_player is None:
                steam_data = await self._fetch_steam_player(steam_id)
                steam_player = SteamPlayer(**steam_data.model_dump())
                steam_player = await self.steam_player_repo.create(steam_player)

            player = await self.player_repo.get_by_steam_id(steam_player.steam_id)
            if player is None:
                player = await self.player_repo.create(
                    Player(steam_id=steam_player.steam_id)
                )

            user_player = await self.user_player_repo.get_by_user_and_player(
                user_id=user_id,
                player_id=player.id,
            )
            if user_player is None:
                user_player = UserPlayer(user_id=user_id, player_id=player.id)
                await self.user_player_repo.create(user_player)
            elif not user_player.is_tracked:
                await self.user_player_repo.update(user_player, {"is_tracked": True})

            await self.session.commit()
            return self._to_response(player, steam_player, user_player.is_tracked)
        except Exception:
            await self.session.rollback()
            raise

    async def get_players_for_user(self, user_id: UUID) -> list[PlayerResponse]:
        user_players = await self.user_player_repo.get_all_for_user(user_id)
        return [
            self._to_response(
                user_player.player,
                user_player.player.steam_player,
                user_player.is_tracked,
            )
            for user_player in user_players
        ]

    async def update_tracking(
        self,
        user_id: UUID,
        player_id: UUID,
        is_tracked: bool,
    ) -> PlayerResponse:
        try:
            user_player = await self.user_player_repo.get_by_user_and_player(
                user_id,
                player_id,
            )
            if user_player is None:
                raise TrackedPlayerNotFoundError()

            user_player = await self.user_player_repo.update(
                user_player,
                {"is_tracked": is_tracked},
            )
            player = await self.player_repo.get_by_id(player_id)
            if player is None:
                raise TrackedPlayerNotFoundError()
            steam_player = await self.steam_player_repo.get_by_steam_id(player.steam_id)
            if steam_player is None:
                raise TrackedPlayerNotFoundError()

            await self.session.commit()
            return self._to_response(player, steam_player, user_player.is_tracked)
        except Exception:
            await self.session.rollback()
            raise

    async def remove_player_for_user(
        self, user_id: UUID, player_id: UUID
    ) -> OperationResponse:
        try:
            user_player = await self.user_player_repo.get_by_user_and_player(
                user_id,
                player_id,
            )
            if user_player is None:
                raise TrackedPlayerNotFoundError()

            await self.user_player_repo.delete(user_player)
            await self.session.commit()
            return OperationResponse()
        except Exception:
            await self.session.rollback()
            raise

    async def sync_player_for_user(
        self,
        user_id: UUID,
        player_id: UUID,
    ) -> PlayerResponse:
        try:
            user_player = await self.user_player_repo.get_by_user_and_player(
                user_id,
                player_id,
            )
            if user_player is None:
                raise TrackedPlayerNotFoundError()

            player = await self.player_repo.get_by_id(player_id)
            if player is None:
                raise TrackedPlayerNotFoundError()
            steam_player = await self.steam_player_repo.get_by_steam_id(player.steam_id)
            if steam_player is None:
                raise TrackedPlayerNotFoundError()

            steam_data = await self._fetch_steam_player(steam_player.steam_id)
            update_data = steam_data.model_dump(
                exclude={"steam_id"},
                exclude_unset=True,
            )
            steam_player = await self.steam_player_repo.update(
                steam_player,
                update_data,
            )

            await self.session.commit()
            await self.session.refresh(steam_player)
            return self._to_response(player, steam_player, user_player.is_tracked)
        except Exception:
            await self.session.rollback()
            raise
