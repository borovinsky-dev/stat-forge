import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ExternalLink, RefreshCw } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { getPlayer, syncPlayer } from "../services/players";
import type { PlayerResponse } from "../types/player";
import defaultAvatar from "../../../assets/avatar/default-avatar.png";
import "./PlayerProfilePage.css";

function formatDate(value: string | null): string {
    return value ? new Date(value).toLocaleString() : "Not available";
}

function formatLastLogoff(value: number | null): string {
    return value ? new Date(value * 1000).toLocaleString() : "Not available";
}

function visibilityLabel(value: number | null): string {
    if (value === 1) return "Private";
    if (value === 2) return "Friends only";
    if (value === 3) return "Public";
    return "Unknown";
}

function profileStateLabel(value: number | null): string {
    if (value === 1) return "Configured";
    if (value === 0) return "Not configured";
    return "Unknown";
}

export function PlayerProfilePage() {
    const { playerId = "" } = useParams();
    const [player, setPlayer] = useState<PlayerResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [error, setError] = useState("");

    const loadPlayer = useCallback(async (signal?: AbortSignal) => {
        try {
            const result = await getPlayer(playerId, signal);
            if (!signal?.aborted) {
                setPlayer(result);
                setError("");
            }
        } catch (cause) {
            if (!signal?.aborted) {
                setError(cause instanceof Error ? cause.message : "Could not load player.");
            }
        } finally {
            if (!signal?.aborted) setLoading(false);
        }
    }, [playerId]);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        void loadPlayer(controller.signal);
        return () => controller.abort();
    }, [loadPlayer]);

    async function handleSync() {
        try {
            setSyncing(true);
            setError("");
            setPlayer(await syncPlayer(playerId));
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : "Could not sync player.");
        } finally {
            setSyncing(false);
        }
    }

    return (
        <main className="player-profile-page">
            <Link className="player-profile-back" to="/players">
                <ArrowLeft size={17} /> Back to players
            </Link>

            {loading && <section className="player-profile-card player-profile-state">Loading player…</section>}
            {!loading && error && !player && (
                <section className="player-profile-card player-profile-state">
                    <p className="player-profile-error" role="alert">{error}</p>
                    <button className="player-profile-secondary" type="button" onClick={() => void loadPlayer()}>
                        Try again
                    </button>
                </section>
            )}

            {!loading && player && (
                <>
                    <section className="player-profile-card player-profile-hero">
                        <img
                            className="player-profile-avatar"
                            src={player.avatar_url || defaultAvatar}
                            alt={player.username}
                            onError={(event) => {
                                event.currentTarget.onerror = null;
                                event.currentTarget.src = defaultAvatar;
                            }}
                        />
                        <div className="player-profile-identity">
                            <p className="player-profile-eyebrow">Steam player</p>
                            <h1>{player.username}</h1>
                            <p className="player-profile-id">Steam ID: {player.steam_id}</p>
                            {player.profile_url && (
                                <a className="player-profile-external" href={player.profile_url} target="_blank" rel="noreferrer">
                                    Open Steam profile <ExternalLink size={14} />
                                </a>
                            )}
                        </div>
                        <button
                            className="player-profile-sync"
                            type="button"
                            onClick={handleSync}
                            disabled={syncing}
                        >
                            <RefreshCw size={16} className={syncing ? "player-profile-spinning" : ""} />
                            {syncing ? "Syncing…" : "Sync profile"}
                        </button>
                    </section>

                    {error && <p className="player-profile-error" role="alert">{error}</p>}

                    <section className="player-profile-card">
                        <div className="player-profile-section-heading">
                            <h2>Profile information</h2>
                            <span className={`player-profile-badge ${player.is_tracked ? "is-tracked" : ""}`}>
                                {player.is_tracked ? "Tracking" : "Not tracking"}
                            </span>
                        </div>
                        <dl className="player-profile-grid">
                            <div><dt>Country</dt><dd>{player.country_code || "Not available"}</dd></div>
                            <div><dt>Visibility</dt><dd>{visibilityLabel(player.community_visibility_state)}</dd></div>
                            <div><dt>Profile state</dt><dd>{profileStateLabel(player.profile_state)}</dd></div>
                            <div><dt>Last online</dt><dd>{formatLastLogoff(player.last_logoff)}</dd></div>
                            <div><dt>Stat Forge status</dt><dd>{player.is_active ? "Active" : "Inactive"}</dd></div>
                            <div><dt>Last synchronized</dt><dd>{formatDate(player.last_fetched_at)}</dd></div>
                        </dl>
                    </section>
                </>
            )}
        </main>
    );
}
