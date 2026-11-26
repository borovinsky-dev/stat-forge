from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class PlayerGameSnapshotResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    player_game_id: UUID
    playtime_forever: int
    playtime_2weeks: int | None
    playtime_windows_forever: int | None
    rtime_last_played: int | None
    captured_at: datetime
