import { useCallback, useEffect, useState } from "react";
import { Clock3, Laptop, Monitor, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import { getSessions, revokeSession } from "../services/sessions";
import type { UserSession } from "../types/session";
import "./SettingsPage.css";

function describeDevice(userAgent: string | null): { name: string; Icon: typeof Monitor } {
    if (!userAgent) return { name: "Unknown device", Icon: Monitor };

    const browser = userAgent.includes("Edg/")
        ? "Microsoft Edge"
        : userAgent.includes("Firefox/")
            ? "Firefox"
            : userAgent.includes("Chrome/")
                ? "Google Chrome"
                : userAgent.includes("Safari/")
                    ? "Safari"
                    : "Browser";
    const platform = /Windows/i.test(userAgent)
        ? "Windows"
        : /Android/i.test(userAgent)
            ? "Android"
            : /iPhone|iPad/i.test(userAgent)
                ? "iOS"
                : /Mac OS/i.test(userAgent)
                    ? "macOS"
                    : /Linux/i.test(userAgent)
                        ? "Linux"
                        : "Unknown platform";
    const Icon = /Mobile|Android|iPhone/i.test(userAgent) ? Smartphone : Laptop;

    return { name: `${browser} on ${platform}`, Icon };
}

function formatDate(value: string | null): string {
    if (!value) return "Not recorded yet";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Unknown";
    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}

export function SecurityPage() {
    const { signOut, signOutAll } = useAuth();
    const navigate = useNavigate();
    const [sessions, setSessions] = useState<UserSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingSessionId, setLoadingSessionId] = useState<string | null>(null);
    const [endingAllSessions, setEndingAllSessions] = useState(false);
    const [error, setError] = useState("");

    const loadSessions = useCallback(async (signal?: AbortSignal) => {
        try {
            const data = await getSessions(signal);
            if (!signal?.aborted) {
                setSessions(data);
                setError("");
            }
        } catch (cause) {
            if (!signal?.aborted) {
                setError(cause instanceof Error ? cause.message : "Could not load active sessions.");
            }
        } finally {
            if (!signal?.aborted) setLoading(false);
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        void loadSessions(controller.signal);
        return () => controller.abort();
    }, [loadSessions]);

    async function handleEndSession(session: UserSession) {
        setError("");
        setLoadingSessionId(session.id);
        try {
            if (session.is_current) {
                await signOut();
                navigate("/login", { replace: true });
                return;
            }
            await revokeSession(session.id);
            setSessions((current) => current.filter((item) => item.id !== session.id));
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : "Could not end this session.");
        } finally {
            setLoadingSessionId(null);
        }
    }

    async function handleEndAllSessions() {
        const confirmed = window.confirm(
            "This will end all active sessions, including this device, and sign you out. Continue?",
        );
        if (!confirmed) return;

        setError("");
        setEndingAllSessions(true);
        try {
            await signOutAll();
            navigate("/login", { replace: true });
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : "Could not end all sessions.");
            setEndingAllSessions(false);
        }
    }

    return (
        <div className="settings-page">
            <header className="settings-heading">
                <h1>Active sessions</h1>
                <p>Review where your account is signed in. End any session you do not recognize or use anymore.</p>
            </header>

            {error && <p className="sessions-error" role="alert">{error}</p>}

            <section className="sessions-card" aria-label="Active sessions">
                <div className="sessions-card-heading">
                    <div>
                        <h2>Your devices</h2>
                        <p>Sessions expire automatically when their sign-in period ends.</p>
                    </div>
                    <div className="sessions-header-actions">
                        <span className="sessions-count">{sessions.length} {sessions.length === 1 ? "session" : "sessions"}</span>
                        <button
                            className="end-all-sessions-button"
                            type="button"
                            onClick={() => void handleEndAllSessions()}
                            disabled={loading || sessions.length === 0 || endingAllSessions}
                        >
                            {endingAllSessions ? "Ending…" : "End all sessions"}
                        </button>
                    </div>
                </div>

                {loading ? (
                    <p className="sessions-empty-state">Loading active sessions…</p>
                ) : sessions.length === 0 ? (
                    <p className="sessions-empty-state">No active sessions found.</p>
                ) : (
                    <ul className="sessions-list">
                        {sessions.map((session) => {
                            const device = describeDevice(session.user_agent);
                            const DeviceIcon = device.Icon;
                            const isBusy = loadingSessionId === session.id;

                            return (
                                <li className="session-item" key={session.id}>
                                    <span className="session-device-icon"><DeviceIcon size={20} /></span>
                                    <div className="session-details">
                                        <div className="session-title-row">
                                            <h3>{device.name}</h3>
                                            {session.is_current && <span className="current-session-badge">This device</span>}
                                        </div>
                                        <p><Clock3 size={14} /> Last active {formatDate(session.last_used_at)}</p>
                                        <span className="session-created">Signed in {formatDate(session.created_at)} · Expires {formatDate(session.expires_at)}</span>
                                    </div>
                                    <button
                                        className="end-session-button"
                                        type="button"
                                        onClick={() => void handleEndSession(session)}
                                        disabled={isBusy}
                                    >
                                        {isBusy ? "Ending…" : "End session"}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>
        </div>
    );
}
