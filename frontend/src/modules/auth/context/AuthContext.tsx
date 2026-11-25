import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import * as authService from "../services/auth";
import type { LoginPayload, RegisterPayload, User } from "../types/auth";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
    user: User | null;
    status: AuthStatus;
    signIn: (payload: LoginPayload) => Promise<void>;
    signUp: (payload: RegisterPayload) => Promise<void>;
    signOut: () => Promise<void>;
    signOutAll: () => Promise<void>;
    updateProfile: (payload: { username: string; email: string }) => Promise<User>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [status, setStatus] = useState<AuthStatus>("loading");

    useEffect(() => {
        const controller = new AbortController();
        void authService.getCurrentUser(controller.signal)
            .then((currentUser) => {
                setUser(currentUser);
                setStatus("authenticated");
            })
            .catch(() => {
                if (!controller.signal.aborted) {
                    setUser(null);
                    setStatus("unauthenticated");
                }
            });
        return () => controller.abort();
    }, []);

    const signIn = useCallback(async (payload: LoginPayload) => {
        const currentUser = await authService.login(payload);
        setUser(currentUser);
        setStatus("authenticated");
    }, []);

    const signUp = useCallback(async (payload: RegisterPayload) => {
        const currentUser = await authService.register(payload);
        setUser(currentUser);
        setStatus("authenticated");
    }, []);

    const signOut = useCallback(async () => {
        await authService.logout();
        setUser(null);
        setStatus("unauthenticated");
    }, []);

    const signOutAll = useCallback(async () => {
        await authService.logoutAll();
        setUser(null);
        setStatus("unauthenticated");
    }, []);

    const updateProfile = useCallback(async (payload: { username: string; email: string }) => {
        const updatedUser = await authService.updateProfile(payload);
        setUser(updatedUser);
        return updatedUser;
    }, []);

    const value = useMemo(() => ({ user, status, signIn, signUp, signOut, signOutAll, updateProfile }), [user, status, signIn, signUp, signOut, signOutAll, updateProfile]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
}
