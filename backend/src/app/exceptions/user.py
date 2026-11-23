from .base import AppException


class UserAlreadyExistsError(AppException):
    def __init__(self, email: str):
        self.email = email
        super().__init__(f"User with email {email} already exists")

    def __str__(self) -> str:
        return f"User with email {self.email} already exists"


class InactiveUserError(AppException):
    """User account is inactive."""
