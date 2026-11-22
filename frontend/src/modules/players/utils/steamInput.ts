/**
 * Разбор пользовательского ввода: чистый Steam ID или ссылка
 * на профиль Steam одного из двух видов:
 *
 *   https://steamcommunity.com/profiles/76561198012345678
 *   https://steamcommunity.com/id/gabelogannewell
 */

/** Результат разбора ввода пользователя. */
export type SteamInput =
    | { kind: "steam-id"; steamId: string }
    | { kind: "profile-id"; steamId: string }
    | { kind: "vanity"; vanityId: string }
    | { kind: "invalid"; reason: string };

const STEAM_ID_PATTERN = /^\d{17}$/;

/** Извлекает путь URL без протокола, домена, query и хэша. */
function extractPath(rawInput: string): string | null {
    const withProtocol = /^https?:\/\//i.test(rawInput)
        ? rawInput
        : `https://${rawInput}`;

    try {
        const url = new URL(withProtocol);

        if (!/(^|\.)steamcommunity\.com$/i.test(url.hostname)) {
            return null;
        }

        return url.pathname.replace(/\/+$/, "");
    } catch {
        return null;
    }
}

/**
 * Определяет вид введённых данных. Пробелы по краям допустимы,
 * регистр и наличие протокола в ссылке — не важны.
 */
export function parseSteamInput(rawInput: string): SteamInput {
    const input = rawInput.trim();

    if (STEAM_ID_PATTERN.test(input)) {
        return { kind: "steam-id", steamId: input };
    }

    const path = extractPath(input);

    if (path === null) {
        return {
            kind: "invalid",
            reason: "Enter a 17-digit Steam ID or a steamcommunity.com profile link.",
        };
    }

    const profilesMatch = /^\/profiles\/(\d{17})$/.exec(path);

    if (profilesMatch !== null) {
        return { kind: "profile-id", steamId: profilesMatch[1] };
    }

    if (/^\/profiles\//.test(path)) {
        return {
            kind: "invalid",
            reason: "The profile link must contain a 17-digit Steam ID.",
        };
    }

    const vanityMatch = /^\/id\/([^/]+)$/.exec(path);

    if (vanityMatch !== null) {
        return { kind: "vanity", vanityId: vanityMatch[1] };
    }

    return {
        kind: "invalid",
        reason: "Unsupported link. Use steamcommunity.com/profiles/... or /id/...",
    };
}
