from pydantic import BaseModel


class SteamPlayer(BaseModel):
    steamid: str
    # настройка приватности аккаунта пользователя(закрытый или нет)
    communityvisibilitystate: int | None = None
    # профиль настроен или нет
    profilestate: int | None = None
    # отображаемое имя пользователя
    personaname: str
    # последний выход из стим в секундах
    lastlogoff: int | None = None
    # ссылка пользователя
    profileurl: str | None = None
    avatar: str | None = None
    avatarmedium: str | None = None
    avatarfull: str | None = None


class SteamPlayerSummariesData(BaseModel):
    players: list[SteamPlayer]


class SteamPlayerSummariesResponse(BaseModel):
    response: SteamPlayerSummariesData
