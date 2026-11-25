from .base import AppException


class SteamPlayerNotFoundError(AppException):
    """Steam API did not find a player with the provided Steam ID."""


class InvalidSteamProfileError(AppException):
    """The provided value is not a supported Steam ID or profile URL."""


class SteamApiUnavailableError(AppException):
    """Steam API could not be reached or returned an unsuccessful response."""


class TrackedPlayerNotFoundError(AppException):
    """The player is not associated with the current user."""
