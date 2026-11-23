from ..base import Base
from uuid import UUID
from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import (
    TIMESTAMP,
    Integer,
    ForeignKey,
    BIGINT,
    UniqueConstraint,
)


class PlayerGame(Base):

    __table_args__ = (
        UniqueConstraint("player_id", "game_id", name="uq_players_games"),
    )

    player_id: Mapped[UUID] = mapped_column(ForeignKey("players.id"), nullable=False)
    game_id: Mapped[UUID] = mapped_column(ForeignKey("games.id"), nullable=False)
    # Общее игровое время в минутах
    playtime_forever: Mapped[int | None] = mapped_column(BIGINT)
    # Игровое время за последние 2 недели
    playtime_2weeks: Mapped[int | None] = mapped_column(Integer)
    # Время на Windows
    playtime_windows_forever: Mapped[int | None] = mapped_column(BIGINT)
    # Unix timestamp последнего запуска
    rtime_last_played: Mapped[int | None] = mapped_column(BIGINT)
    # Когда StatForge последний раз получил статистику
    last_fetched_at: Mapped[datetime | None] = mapped_column(TIMESTAMP(timezone=True))

    game: Mapped["Game"] = relationship(back_populates="player_games")
    player: Mapped["Player"] = relationship(back_populates="player_games")
    player_game_snapshots: Mapped[list["PlayerGameSnapshot"]] = relationship(
        back_populates="player_game"
    )
