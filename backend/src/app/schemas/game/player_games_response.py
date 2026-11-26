from pydantic import BaseModel

from .player_game_response import PlayerGameResponse


class PlayerGamesResponse(BaseModel):
    games: list[PlayerGameResponse]
    # None means the library has not been checked yet; False means Steam did not
    # expose game details on the latest sync.
    is_available: bool | None = None
    message: str | None = None
