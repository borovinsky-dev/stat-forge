import { apiRequest } from "../../../shared/services/api";
import type { LoginPayload, RegisterPayload, User } from "../types/auth";

export function getCurrentUser(signal?: AbortSignal): Promise<User> {
    return apiRequest<User>("/auth/me", { signal });
}

export function login(payload: LoginPayload): Promise<User> {
    return apiRequest<User>("/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export function register(payload: RegisterPayload): Promise<User> {
    return apiRequest<User>("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export function logout(): Promise<void> {
    return apiRequest<void>("/auth/logout", { method: "POST" });
}

export function logoutAll(): Promise<void> {
    return apiRequest<void>("/auth/logout-all", { method: "POST" });
}

export function updateProfile(payload: { username: string; email: string }): Promise<User> {
    return apiRequest<User>("/auth/me", {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
}

export function changePassword(payload: {
    current_password: string;
    new_password: string;
}): Promise<void> {
    return apiRequest<void>("/auth/password", {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
}
