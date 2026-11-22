const API_URL = `${import.meta.env.VITE_API_URL?.replace(/\/$/, "")}/api/v1`;

export async function apiRequest<T>(
    endpoint: string,
    options?: RequestInit,
): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        cache: "no-store",
        headers: {
            "Content-Type": "application/json",
            ...options?.headers,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
            errorData?.detail ?? `API Error: ${response.status}`,
        );
    }

    return response.json() as Promise<T>;
}