
export interface PlayerCreate {
    steam_id: string;
    username: string;
    avatar_url?: string | null;
    profile_url?: string | null;
    country_code?: string | null;
}

export interface PlayerResponse {
    id: string;
    steam_id: string;
    username: string;
    avatar_url: string | null;
    profile_url: string | null;
    country_code: string | null;
    is_tracked: boolean;
}

export interface PlayerUpdate {
    is_tracked?: boolean;
}

/** Способ, которым пользователь вводит игрока. */
export type PlayerInputMode = "steam-id" | "profile-url";

/** Раздел Players: список игроков или форма добавления. */
export type PlayersView = "list" | "add";

