import { createContext } from "react";
import type { User } from "../types/auth";
import type { LoginPayload, RegisterPayload } from "../types/auth";

export interface AuthContextValue {
    user: User | null;
    status: "loading" | "authenticated" | "unauthenticated";
    signIn: (payload: LoginPayload) => Promise<void>;
    signUp: (payload: RegisterPayload) => Promise<void>;
    signOut: () => Promise<void>;
    signOutAll: () => Promise<void>;
    updateProfile: (payload: { username: string; email: string }) => Promise<User>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
