import { apiRequest } from "../../../shared/services/api";
import type { UserSession } from "../types/session";

export function getSessions(signal?: AbortSignal): Promise<UserSession[]> {
    return apiRequest<UserSession[]>("/auth/sessions", { signal });
}

export function revokeSession(sessionId: string): Promise<void> {
    return apiRequest<void>(`/auth/sessions/${encodeURIComponent(sessionId)}`, {
        method: "DELETE",
    });
}
