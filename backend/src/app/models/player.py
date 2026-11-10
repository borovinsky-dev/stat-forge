from .base import Base
from sqlalchemy import String, Boolean, text
from sqlalchemy.orm import Mapped, mapped_column


class Player(Base):
    steam_id: Mapped[str] = mapped_column(String(17), unique=True, nullable=False)
    username: Mapped[str] = mapped_column(String(50), nullable=False)
    avatar_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    profile_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default=text("true")
    )
    country_code: Mapped[str | None] = mapped_column(String(2), nullable=True)
