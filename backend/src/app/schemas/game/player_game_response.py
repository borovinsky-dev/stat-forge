from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from .game_response import GameResponse


class PlayerGameResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    player_id: UUID
    game_id: UUID
    game: GameResponse
    playtime_forever: int | None
    playtime_2weeks: int | None
    playtime_windows_forever: int | None
    rtime_last_played: int | None
    last_fetched_at: datetime | None
