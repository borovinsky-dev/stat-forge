from uuid import uuid4, UUID
from sqlalchemy import Uuid
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, declared_attr


class Base(DeclarativeBase):
    # общие поля для базовой модели
    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)

    # для имен таблиц в БД
    @declared_attr.directive
    def __tablename__(cls) -> str:
        name: str = cls.__name__.lower()
        if name.endswith("y") and name[-2] not in "aeiou":
            return name + "ys"
        return name + "s"
