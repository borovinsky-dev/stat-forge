from ..base import Base
from datetime import datetime
from sqlalchemy import Boolean, TIMESTAMP, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship


class Player(Base):
    steam_id: Mapped[str] = mapped_column(
        ForeignKey("steamplayers.steam_id"), unique=True, nullable=False
    )
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now(), nullable=False
    )

    updated_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    steam_player: Mapped["SteamPlayer"] = relationship(back_populates="player")

    player_games: Mapped[list["PlayerGame"]] = relationship(back_populates="player")

    user_players: Mapped[list["UserPlayer"]] = relationship(back_populates="player")
