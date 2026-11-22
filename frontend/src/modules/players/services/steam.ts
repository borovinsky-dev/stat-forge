
/**
 * Steam API client.
 * Supports Mock Steam API and real Steam Web API.
 */

const API_MODE = import.meta.env.VITE_STEAM_API_MODE ?? "mock";

const API_KEY = import.meta.env.VITE_STEAM_API_KEY ?? "";

const MOCK_API_BASE =
    import.meta.env.VITE_MOCK_STEAM_API_URL ?? "http://localhost:8001";

const STEAM_API_BASE = "https://api.steampowered.com";
const COMMUNITY_BASE = "https://steamcommunity.com";

interface SteamApiResponse {
    response: {
        players: PlayerSummary[];
    };
}

interface PlayerSummary {
    steamid: string;
    personaname: string;
    avatarfull: string | null;
    profileurl: string | null;
    loccountrycode: string | null;
}

export interface ResolvedPlayer {
    steam_id: string;
    username: string;
    avatar_url: string | null;
    profile_url: string | null;
    country_code: string | null;
}

export class SteamApiError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "SteamApiError";
    }
}

export function isSteamApiConfigured(): boolean {
    if (API_MODE === "mock") {
        return true;
    }

    if (API_MODE === "steam") {
        return API_KEY.trim().length > 0;
    }

    return false;
}

function mapPlayer(player: PlayerSummary): ResolvedPlayer {
    return {
        steam_id: player.steamid,
        username: player.personaname,
        avatar_url: player.avatarfull,
        profile_url: player.profileurl,
        country_code: player.loccountrycode,
    };
}

function withKey(params: Record<string, string>): string {
    return new URLSearchParams({
        key: API_KEY,
        ...params,
    }).toString();
}

async function fetchPlayerSummary(
    steamId: string,
): Promise<PlayerSummary> {
    if (!isSteamApiConfigured()) {
        throw new SteamApiError(
            API_MODE === "steam"
                ? "Steam API key is missing."
                : `Unknown Steam API mode: ${API_MODE}`,
        );
    }

    let response: Response;

    try {
        if (API_MODE === "mock") {
            response = await fetch(
                `${MOCK_API_BASE}/api/v1/players/${steamId}`,
                { cache: "no-store" },
            );
        } else {
            const url =
                `${STEAM_API_BASE}/ISteamUser/GetPlayerSummaries/v0002/` +
                `?${withKey({ steamids: steamId })}`;

            response = await fetch(url, { cache: "no-store" });
        }
    } catch {
        throw new SteamApiError(
            API_MODE === "mock"
                ? "Could not reach Mock Steam API. Check whether it is running."
                : "Could not reach Steam. Check your internet connection.",
        );
    }

    if (!response.ok) {
        throw new SteamApiError(
            `${API_MODE === "mock" ? "Mock Steam API" : "Steam API"} error: ${response.status}`,
        );
    }

    const data = (await response.json()) as SteamApiResponse;
    const player = data.response.players[0];

    if (player === undefined) {
        throw new SteamApiError(
            `Steam profile ${steamId} was not found.`,
        );
    }

    return player;
}

export async function resolveSteamPlayer(
    steamIdOrVanity: string,
): Promise<ResolvedPlayer> {
    const query = steamIdOrVanity.trim();

    if (!/^\d{17}$/.test(query)) {
        throw new SteamApiError(
            "Only a 17-digit Steam ID can be resolved. Use a /profiles/... link.",
        );
    }

    const player = await fetchPlayerSummary(query);

    return mapPlayer(player);
}

export function buildProfileUrl(steamId: string): string {
    return `${COMMUNITY_BASE}/profiles/${steamId}`;
}
