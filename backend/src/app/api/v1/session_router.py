from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.api.dependencies.auth import get_current_user, get_session_service
from app.api.dependencies.session import get_session_cookie
from app.api.session_cookies import delete_session_cookie
from app.schemas.user import UserResponse
from app.schemas.session.session_response import SessionResponse
from app.services.user.session_service import SessionService

router = APIRouter(prefix="/auth", tags=["Sessions"])


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    response: Response,
    access_token: str | None = Depends(get_session_cookie),
    session_service: SessionService = Depends(get_session_service),
    _current_user: UserResponse = Depends(get_current_user),
) -> None:
    await session_service.logout(access_token)
    delete_session_cookie(response)


@router.post("/logout-all", status_code=status.HTTP_204_NO_CONTENT)
async def logout_all(
    response: Response,
    session_service: SessionService = Depends(get_session_service),
    current_user: UserResponse = Depends(get_current_user),
) -> None:
    await session_service.logout_all(current_user.id)
    delete_session_cookie(response)


@router.get("/sessions", response_model=list[SessionResponse], status_code=status.HTTP_200_OK)
async def get_sessions(
    access_token: str | None = Depends(get_session_cookie),
    session_service: SessionService = Depends(get_session_service),
    current_user: UserResponse = Depends(get_current_user),
) -> list[SessionResponse]:
    return await session_service.get_active_sessions(current_user.id, access_token)


@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_session(
    session_id: UUID,
    response: Response,
    access_token: str | None = Depends(get_session_cookie),
    session_service: SessionService = Depends(get_session_service),
    current_user: UserResponse = Depends(get_current_user),
) -> None:
    was_current = await session_service.revoke_session_for_user(
        session_id=session_id,
        user_id=current_user.id,
        current_token=access_token,
    )
    if not was_current.found:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found.")
    if was_current.is_current:
        delete_session_cookie(response)
