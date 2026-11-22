import { apiRequest } from "../../../shared/services/api";
import type { PlayerCreate, PlayerResponse, PlayerUpdate } from "../types/player";

/** Список игроков, которые уже отслеживаются. */
export async function getPlayers(signal?: AbortSignal): Promise<PlayerResponse[]> {
    return apiRequest<PlayerResponse[]>("/players/", { signal });
}

export async function addPlayer(data: PlayerCreate): Promise<PlayerResponse> {
    return apiRequest<PlayerResponse>("/players/add", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

/** Убирает игрока из отслеживания. */
export async function deletePlayer(playerId: string): Promise<void> {
    await apiRequest<{ message: string }>(`/players/${playerId}`, {
        method: "DELETE",
    });
}

/** Обновляет данные игрока. */
export async function updatePlayer(
    playerId: string,
    data: PlayerUpdate,
): Promise<PlayerResponse> {
    return apiRequest<PlayerResponse>(`/players/${playerId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}