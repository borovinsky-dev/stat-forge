const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");
const API_URL = import.meta.env.DEV ? "/api/v1" : `${API_BASE_URL}/api/v1`;

export async function apiRequest<T>(
    endpoint: string,
    options?: RequestInit,
): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        cache: "no-store",
        credentials: "include",
        headers: {
            ...(options?.body ? { "Content-Type": "application/json" } : {}),
            ...options?.headers,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const detail = errorData?.detail;
        const message = Array.isArray(detail)
            ? detail.map((issue: { msg?: string }) => issue.msg).filter(Boolean).join(" ")
            : typeof detail === "string"
                ? detail
                : `API Error: ${response.status}`;

        throw new Error(message);
    }

    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
}
