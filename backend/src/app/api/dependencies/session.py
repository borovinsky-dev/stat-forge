from fastapi import Cookie


def get_session_cookie(
    session_token: str | None = Cookie(default=None, alias="session"),
) -> str | None:
    return session_token
