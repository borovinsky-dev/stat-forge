from ..base import Base
from uuid import UUID
from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Boolean, TIMESTAMP, ForeignKey, UniqueConstraint, func


class UserPlayer(Base):

    __table_args__ = (
        UniqueConstraint("user_id", "player_id", name="uq_users_players"),
    )

    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    player_id: Mapped[UUID] = mapped_column(ForeignKey("players.id"), nullable=False)
    is_tracked: Mapped[bool] = mapped_column(Boolean, default=True)

    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now(), nullable=False
    )

    user: Mapped["User"] = relationship(back_populates="user_players")
    player: Mapped["Player"] = relationship(back_populates="user_players")
