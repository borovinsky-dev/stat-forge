from ..base import Base
from datetime import datetime
from sqlalchemy import String, SMALLINT, BIGINT, TIMESTAMP, func
from sqlalchemy.orm import Mapped, mapped_column, relationship


class SteamPlayer(Base):
    # SteamID64
    steam_id: Mapped[str] = mapped_column(String(17), unique=True, nullable=False)
    # имя пользователя
    personaname: Mapped[str] = mapped_column(String(255), nullable=False)
    # ссылка на профиль
    profileurl: Mapped[str | None] = mapped_column(String(500))
    # аватары
    avatar: Mapped[str | None] = mapped_column(String(500))
    avatarmedium: Mapped[str | None] = mapped_column(String(500))
    avatarfull: Mapped[str | None] = mapped_column(String(500))
    # видимость профиля
    communityvisibilitystate: Mapped[int | None] = mapped_column(SMALLINT)
    # состояние профиля
    profilestate: Mapped[int | None] = mapped_column(SMALLINT)
    # время последнего выхода
    lastlogoff: Mapped[int | None] = mapped_column(BIGINT)
    loccountrycode: Mapped[str | None] = mapped_column(String(2))
    # собственное поле от stat-forge для синхронизации данных со steam API
    last_fetched_at: Mapped[datetime | None] = mapped_column(TIMESTAMP(timezone=True))

    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    player: Mapped["Player"] = relationship(back_populates="steam_player")
