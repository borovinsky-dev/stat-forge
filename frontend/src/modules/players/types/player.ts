
export interface PlayerCreate {
    steam_profile: string;
}

export interface PlayerResponse {
    id: string;
    steam_id: string;
    username: string;
    avatar_url: string | null;
    avatar_medium_url: string | null;
    profile_url: string | null;
    country_code: string | null;
    community_visibility_state: number | null;
    profile_state: number | null;
    last_logoff: number | null;
    is_active: boolean;
    is_tracked: boolean;
    last_fetched_at: string | null;
}

export interface PlayerUpdate {
    is_tracked?: boolean;
}

/** Способ, которым пользователь вводит игрока. */
export type PlayerInputMode = "steam-id" | "profile-url";

/** Раздел Players: список игроков или форма добавления. */
export type PlayersView = "list" | "add";

