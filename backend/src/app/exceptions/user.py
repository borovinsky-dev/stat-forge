from .base import AppException


class UserAlreadyExistsError(AppException):
    def __init__(self, email: str | None = None, username: str | None = None):
        self.email = email
        self.username = username
        field, value = ("email", email) if email is not None else ("username", username)
        super().__init__(f"User with {field} {value} already exists")


class InactiveUserError(AppException):
    """User account is inactive."""
