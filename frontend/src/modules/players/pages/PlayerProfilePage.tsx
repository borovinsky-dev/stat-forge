import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Clock3, ExternalLink, Gamepad2, RefreshCw } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { getPlayer, getPlayerStatistics, syncPlayer, syncPlayerStatistics } from "../services/players";
import type { PlayerGameResponse, PlayerResponse } from "../types/player";
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

function formatHours(minutes: number | null): string {
    if (minutes === null) return "Not available";
    return `${(minutes / 60).toLocaleString(undefined, { maximumFractionDigits: 1 })} h`;
}

function formatPlayedAt(value: number | null): string {
    return value ? new Date(value * 1000).toLocaleDateString() : "Never recorded";
}

export function PlayerProfilePage() {
    const { playerId = "" } = useParams();
    const [player, setPlayer] = useState<PlayerResponse | null>(null);
    const [games, setGames] = useState<PlayerGameResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingGames, setLoadingGames] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [syncingGames, setSyncingGames] = useState(false);
    const [error, setError] = useState("");
    const [gamesError, setGamesError] = useState("");
    const [gamesAvailable, setGamesAvailable] = useState<boolean | null>(null);
    const [gamesNotice, setGamesNotice] = useState("");

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
        queueMicrotask(() => {
            if (controller.signal.aborted) return;
            setLoading(true);
            void loadPlayer(controller.signal);
        });
        return () => controller.abort();
    }, [loadPlayer]);

    const loadGames = useCallback(async (signal?: AbortSignal) => {
        try {
            const result = await getPlayerStatistics(playerId, signal);
            if (!signal?.aborted) {
                setGames(result.games);
                setGamesAvailable(result.is_available);
                setGamesNotice(result.message ?? "");
                setGamesError("");
            }
        } catch (cause) {
            if (!signal?.aborted) {
                setGamesError(cause instanceof Error ? cause.message : "Could not load game statistics.");
            }
        } finally {
            if (!signal?.aborted) setLoadingGames(false);
        }
    }, [playerId]);

    useEffect(() => {
        const controller = new AbortController();
        queueMicrotask(() => {
            if (controller.signal.aborted) return;
            setLoadingGames(true);
            void loadGames(controller.signal);
        });
        return () => controller.abort();
    }, [loadGames]);

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

    async function handleGamesSync() {
        try {
            setSyncingGames(true);
            setGamesError("");
            const result = await syncPlayerStatistics(playerId);
            setGames(result.games);
            setGamesAvailable(result.is_available);
            setGamesNotice(result.message ?? "");
        } catch (cause) {
            setGamesError(cause instanceof Error ? cause.message : "Could not sync game statistics.");
        } finally {
            setSyncingGames(false);
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

                    <section className="player-profile-card player-games-card">
                        <div className="player-profile-section-heading">
                            <div>
                                <h2><Gamepad2 size={18} /> Game statistics</h2>
                                <p>Playtime and recent activity reported by Steam.</p>
                            </div>
                            <button
                                className="player-profile-sync"
                                type="button"
                                onClick={handleGamesSync}
                                disabled={syncingGames}
                            >
                                <RefreshCw size={16} className={syncingGames ? "player-profile-spinning" : ""} />
                                {syncingGames ? "Syncing games…" : "Sync games"}
                            </button>
                        </div>

                        {gamesError && <div className="player-profile-games-error" role="alert">
                            <p className="player-profile-error">{gamesError}</p>
                            <button className="player-profile-secondary" type="button" onClick={() => void loadGames()}>
                                Retry
                            </button>
                        </div>}
                        {loadingGames ? (
                            <p className="player-profile-muted">Loading game statistics…</p>
                        ) : gamesError ? null : games.length === 0 ? (
                            <div className={`player-profile-empty-games ${gamesAvailable === false ? "is-unavailable" : ""}`}>
                                <Gamepad2 size={24} />
                                <span>{gamesAvailable === false
                                    ? `${gamesNotice} Set Game details to Public on this Steam profile to import stats.`
                                    : gamesAvailable === true
                                        ? "Steam returned no visible games for this profile."
                                        : "No game statistics yet. Sync games to fetch this player’s Steam library."}</span>
                            </div>
                        ) : (
                            <div className="player-games-list">
                                {games.map((item) => (
                                    <article className="player-game-row" key={item.id}>
                                        {item.game.img_icon_url ? (
                                            <img src={item.game.img_icon_url} alt="" loading="lazy" />
                                        ) : (
                                            <span className="player-game-fallback"><Gamepad2 size={18} /></span>
                                        )}
                                        <div className="player-game-name">
                                            <strong>{item.game.name}</strong>
                                            <span><Clock3 size={13} /> Last played {formatPlayedAt(item.rtime_last_played)}</span>
                                        </div>
                                        <div className="player-game-stat">
                                            <strong>{formatHours(item.playtime_forever)}</strong>
                                            <span>Total playtime</span>
                                        </div>
                                        <div className="player-game-stat">
                                            <strong>{formatHours(item.playtime_2weeks)}</strong>
                                            <span>Past 2 weeks</span>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                </>
            )}
        </main>
    );
}
