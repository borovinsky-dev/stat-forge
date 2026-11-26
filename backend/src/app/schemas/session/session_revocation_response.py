from uuid import UUID

from pydantic import BaseModel


class SessionRevocationResponse(BaseModel):
    session_id: UUID
    found: bool
    revoked: bool
    is_current: bool
