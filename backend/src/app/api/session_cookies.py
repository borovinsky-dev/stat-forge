from fastapi import Response


def set_session_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key="session",
        value=token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=30 * 24 * 60 * 60,
        path="/",
    )


def delete_session_cookie(response: Response) -> None:
    response.delete_cookie(
        key="session",
        httponly=True,
        secure=False,
        samesite="lax",
        path="/",
    )
