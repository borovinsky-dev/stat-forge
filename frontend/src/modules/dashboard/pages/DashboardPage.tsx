import { useEffect, useMemo, useState } from "react";
import { Activity, Clock3, Gamepad2, RefreshCw, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "../../auth/context/useAuth";
import { getPlayerStatistics, getPlayers, syncPlayerStatistics } from "../../players/services/players";
import type { PlayerGameResponse, PlayerResponse } from "../../players/types/player";
import "./DashboardPage.css";

interface PlayerGames {
    player: PlayerResponse;
    games: PlayerGameResponse[];
    isAvailable: boolean | null;
}

function formatHours(minutes: number): string {
    return `${(minutes / 60).toLocaleString(undefined, { maximumFractionDigits: 1 })} h`;
}

function formatRelative(value: string | null): string {
    if (!value) return "Never synced";
    const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60_000));
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;
    return `${Math.floor(hours / 24)} d ago`;
}

export function DashboardPage() {
    const { user } = useAuth();
    const [players, setPlayers] = useState<PlayerResponse[]>([]);
    const [playerGames, setPlayerGames] = useState<PlayerGames[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [syncMessage, setSyncMessage] = useState("");
    const [syncingAll, setSyncingAll] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        const controller = new AbortController();

        async function loadDashboard() {
            try {
                const allPlayers = await getPlayers(controller.signal);
                const trackedPlayers = allPlayers.filter((player) => player.is_tracked);
                const stats = await Promise.all(
                    trackedPlayers.map(async (player) => {
                        const result = await getPlayerStatistics(player.id, controller.signal);
                        return { player, games: result.games, isAvailable: result.is_available };
                    }),
                );
                if (!controller.signal.aborted) {
                    setPlayers(trackedPlayers);
                    setPlayerGames(stats);
                    setError("");
                }
            } catch (cause) {
                if (!controller.signal.aborted) {
                    setError(cause instanceof Error ? cause.message : "Could not load dashboard data.");
                }
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }

        queueMicrotask(() => {
            if (!controller.signal.aborted) void loadDashboard();
        });
        return () => controller.abort();
    }, [reloadKey]);

    async function handleSyncAllGames() {
        if (players.length === 0 || syncingAll) return;
        setSyncingAll(true);
        setError("");
        setSyncMessage("");

        const failedPlayers: string[] = [];
        const unavailablePlayers: string[] = [];
        let syncedCount = 0;
        for (const player of players) {
            try {
                const result = await syncPlayerStatistics(player.id);
                if (result.is_available === false) unavailablePlayers.push(player.username);
                else syncedCount += 1;
            } catch {
                failedPlayers.push(player.username);
            }
        }

        if (failedPlayers.length > 0) {
            setError(
                `Could not reach Steam while syncing ${failedPlayers.join(", ")}. Try again later.`,
            );
        }
        const unavailableNote = unavailablePlayers.length > 0
            ? ` Game details are private for ${unavailablePlayers.join(", ")}; their stats were skipped.`
            : "";
        setSyncMessage(`Game statistics synced for ${syncedCount} of ${players.length} players.${unavailableNote}`);

        setReloadKey((key) => key + 1);
        setSyncingAll(false);
    }

    const gameTotals = useMemo(() => {
        const totals = new Map<string, {
            id: string;
            name: string;
            icon: string;
            players: Set<string>;
            totalMinutes: number;
            recentMinutes: number;
        }>();

        for (const { player, games } of playerGames) {
            for (const item of games) {
                const current = totals.get(item.game.id) ?? {
                    id: item.game.id,
                    name: item.game.name,
                    icon: item.game.img_icon_url,
                    players: new Set<string>(),
                    totalMinutes: 0,
                    recentMinutes: 0,
                };
                current.players.add(player.id);
                current.totalMinutes += item.playtime_forever ?? 0;
                current.recentMinutes += item.playtime_2weeks ?? 0;
                totals.set(item.game.id, current);
            }
        }

        return [...totals.values()];
    }, [playerGames]);

    const sortedGames = [...gameTotals].sort((a, b) => b.totalMinutes - a.totalMinutes);
    const topGames = sortedGames.slice(0, 5);
    const activeGames = gameTotals.length;
    const totalMinutes = gameTotals.reduce((sum, game) => sum + game.totalMinutes, 0);
    const recentMinutes = gameTotals.reduce((sum, game) => sum + game.recentMinutes, 0);
    const unavailableStatsCount = playerGames.filter((item) => item.isAvailable === false).length;
    const mostRecentGames = [...gameTotals].sort((a, b) => b.recentMinutes - a.recentMinutes).slice(0, 6);
    const maxRecentMinutes = Math.max(...mostRecentGames.map((game) => game.recentMinutes), 1);
    const recentPlayers = [...players]
        .sort((a, b) => new Date(b.last_fetched_at ?? 0).getTime() - new Date(a.last_fetched_at ?? 0).getTime())
        .slice(0, 4);

    return (
        <div className="dashboard-page">
            <header className="dashboard-heading">
                <div>
                    <p className="dashboard-kicker">WORKSPACE OVERVIEW</p>
                    <h1>Welcome back, {user?.username ?? "Player"}</h1>
                        <p className="dashboard-description">A snapshot of the players and games you follow.</p>
                </div>
                <div className="dashboard-heading-actions">
                    <span className={`dashboard-live-badge ${loading ? "is-loading" : ""}`}>
                        <span /> {loading ? "Updating" : "Live data"}
                    </span>
                    <button
                        className="dashboard-sync-button"
                        type="button"
                        onClick={() => void handleSyncAllGames()}
                        disabled={loading || syncingAll || players.length === 0}
                    >
                        <RefreshCw size={15} className={syncingAll ? "dashboard-sync-spinning" : ""} />
                        {syncingAll ? "Syncing games…" : "Sync all games"}
                    </button>
                </div>
            </header>

            {syncMessage && <p className="dashboard-sync-success" role="status">{syncMessage}</p>}
            {error && <div className="dashboard-error" role="alert">
                <p>{error}</p>
                <button type="button" onClick={() => {
                    setLoading(true);
                    setReloadKey((key) => key + 1);
                }}>Retry</button>
            </div>}

            <section className="dashboard-metrics" aria-label="Workspace summary">
                <article className="dashboard-metric-card">
                    <span className="dashboard-metric-icon metric-blue"><UsersRound size={18} /></span>
                    <span className="dashboard-metric-label">Tracked players</span>
                    <strong>{loading ? "—" : players.length}</strong>
                    <span className="dashboard-metric-note">Players you follow</span>
                </article>
                <article className="dashboard-metric-card">
                    <span className="dashboard-metric-icon metric-violet"><Gamepad2 size={18} /></span>
                    <span className="dashboard-metric-label">Games in library</span>
                    <strong>{loading ? "—" : activeGames}</strong>
                    <span className="dashboard-metric-note">Across tracked players</span>
                </article>
                <article className="dashboard-metric-card">
                    <span className="dashboard-metric-icon metric-cyan"><Clock3 size={18} /></span>
                    <span className="dashboard-metric-label">Total playtime</span>
                    <strong>{loading ? "—" : formatHours(totalMinutes)}</strong>
                    <span className="dashboard-metric-note">Combined tracked playtime</span>
                </article>
                <article className="dashboard-metric-card">
                    <span className="dashboard-metric-icon metric-green"><Activity size={18} /></span>
                    <span className="dashboard-metric-label">Last 2 weeks</span>
                    <strong>{loading ? "—" : formatHours(recentMinutes)}</strong>
                    <span className="dashboard-metric-note">Reported by Steam</span>
                </article>
            </section>

            <section className="dashboard-main-grid">
                <article className="dashboard-panel playtime-panel">
                    <div className="dashboard-panel-heading">
                        <div>
                            <h2>Most played recently</h2>
                            <p>Playtime reported for the past two weeks</p>
                        </div>
                        <span className="dashboard-period">Last 14 days</span>
                    </div>
                    {loading ? <p className="dashboard-state">Loading game statistics…</p> : mostRecentGames.length === 0 ? (
                        <p className="dashboard-state">{unavailableStatsCount > 0
                            ? "Some Steam profiles do not share game details; their stats are skipped."
                            : "Sync a player’s games to see playtime here."}</p>
                    ) : (
                        <div className="recent-games-list">
                            {mostRecentGames.map((game) => (
                                <div className="recent-game-item" key={game.id}>
                                    <span>{game.name}</span>
                                    <div className="recent-game-track"><span style={{ width: `${Math.max(3, game.recentMinutes / maxRecentMinutes * 100)}%` }} /></div>
                                    <strong>{formatHours(game.recentMinutes)}</strong>
                                </div>
                            ))}
                        </div>
                    )}
                </article>

                <article className="dashboard-panel sync-panel">
                    <div className="dashboard-panel-heading">
                        <div>
                            <h2>Recent profile syncs</h2>
                            <p>Latest Steam profile updates</p>
                        </div>
                        <RefreshCw size={16} className="panel-heading-icon" />
                    </div>
                    {loading ? <p className="dashboard-state">Loading players…</p> : recentPlayers.length === 0 ? (
                        <p className="dashboard-state">No tracked players yet.</p>
                    ) : (
                        <ul className="sync-list">
                            {recentPlayers.map((player) => (
                                <li className="sync-item" key={player.id}>
                                    <span className="sync-avatar">{player.username.slice(0, 2).toUpperCase()}</span>
                                    <span className="sync-player-info">
                                        <strong>{player.username}</strong>
                                        <small>Steam profile updated</small>
                                    </span>
                                    <time>{formatRelative(player.last_fetched_at)}</time>
                                </li>
                            ))}
                        </ul>
                    )}
                    <Link className="dashboard-panel-link" to="/players">View players</Link>
                </article>
            </section>

            <section className="dashboard-panel games-panel">
                <div className="dashboard-panel-heading">
                    <div>
                        <h2>Most played games</h2>
                        <p>Aggregated from your tracked players</p>
                    </div>
                    <Link className="dashboard-panel-link" to="/players">Manage players</Link>
                </div>
                {loading ? <p className="dashboard-state">Loading game statistics…</p> : topGames.length === 0 ? (
                    <p className="dashboard-state">No game data yet. Open a player profile and sync games.</p>
                ) : (
                    <div className="games-table" role="table" aria-label="Most played games">
                        <div className="games-table-head" role="row">
                            <span role="columnheader">Game</span>
                            <span role="columnheader">Players</span>
                            <span role="columnheader">Combined playtime</span>
                            <span role="columnheader">Last 2 weeks</span>
                        </div>
                        {topGames.map((game) => (
                            <div className="games-table-row" role="row" key={game.id}>
                                <strong role="cell">
                                    {game.icon ? <img className="dashboard-game-icon" src={game.icon} alt="" loading="lazy" /> : <span className="game-dot" />}
                                    {game.name}
                                </strong>
                                <span role="cell">{game.players.size}</span>
                                <span role="cell">{formatHours(game.totalMinutes)}</span>
                                <span role="cell" className="game-change">{formatHours(game.recentMinutes)}</span>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
