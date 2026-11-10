from uuid import uuid4, UUID
from sqlalchemy import Uuid
from datetime import datetime
from sqlalchemy import DateTime, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    # общие поля для базовой модели
    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    # для имен таблиц в БД
    @classmethod
    def __tablename__(cls) -> str:
        name: str = cls.__name__.lower()
        if name.endswith("y") and name[-2] not in "aeiou":
            return name + "ys"
        return name + "s"
