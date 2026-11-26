from uuid import UUID

from pydantic import BaseModel, ConfigDict


class GameResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    steam_app_id: int
    name: str
    img_icon_url: str
    is_active: bool
