from .base import AppException
from uuid import UUID


class PlayerAlreadyExistsError(AppException):
    def __init__(self, steam_id: str):
        self.steam_id = steam_id
        super().__init__(f"Player with Steam ID {steam_id} already exists")

    def __str__(self) -> str:
        return f"Player with Steam ID {self.steam_id} already exists"


class PlayerNotFoundError(AppException):
    def __init__(self, player_id: UUID) -> None:
        self.player_id = player_id
        super().__init__(f"Player with ID {player_id} not found")
