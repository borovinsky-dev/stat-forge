from datetime import datetime
from uuid import UUID
from app.models.base import Base

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import BIGINT, Integer, TIMESTAMP, func, ForeignKey


class PlayerGameSnapshot(Base):

    player_game_id: Mapped[UUID] = mapped_column(
        ForeignKey("playergames.id"), nullable=False
    )

    # Общее игровое время в минутах
    playtime_forever: Mapped[int] = mapped_column(BIGINT, nullable=False)

    # Игровое время за последние 2 недели
    playtime_2weeks: Mapped[int | None] = mapped_column(Integer)

    # Время игры на Windows
    playtime_windows_forever: Mapped[int | None] = mapped_column(BIGINT)

    # Unix timestamp последнего запуска
    rtime_last_played: Mapped[int | None] = mapped_column(BIGINT)

    # Когда StatForge получил снимок статистики
    captured_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    player_game: Mapped["PlayerGame"] = relationship(
        back_populates="player_game_snapshots"
    )
