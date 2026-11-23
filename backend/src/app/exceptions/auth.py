from .base import AppException


class InvalidCredentialsError(AppException):
    """Invalid email or password."""


class InvalidSessionError(AppException):
    """Session does not exist or is invalid."""


class SessionExpiredError(AppException):
    """Session has expired."""


class SessionRevokedError(AppException):
    """Session has been revoked."""


class InactiveUserError(AppException):
    """User account is inactive."""
