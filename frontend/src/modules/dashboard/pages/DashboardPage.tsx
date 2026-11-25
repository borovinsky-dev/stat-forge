import {
    Activity,
    Clock3,
    Gamepad2,
    RefreshCw,
    UsersRound,
} from "lucide-react";
import { useAuth } from "../../auth/context/AuthContext";
import "./DashboardPage.css";

const playtimeTrend = [38, 45, 42, 57, 53, 68, 74, 71, 88, 83, 96, 108];
const trendLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const recentSyncs = [
    { name: "Alex Morgan", steamId: "76561198012345678", time: "5 min ago", initials: "AM" },
    { name: "NightOwl", steamId: "76561198123456789", time: "22 min ago", initials: "NO" },
    { name: "PixelPilot", steamId: "76561198234567890", time: "1 hour ago", initials: "PP" },
];

const popularGames = [
    { name: "Counter-Strike 2", players: 8, hours: "1,284 h", change: "+18 h" },
    { name: "Dota 2", players: 6, hours: "936 h", change: "+11 h" },
    { name: "Apex Legends", players: 4, hours: "512 h", change: "+7 h" },
];

function TrendChart() {
    const points = playtimeTrend
        .map((value, index) => `${28 + index * 70},${174 - value * 1.28}`)
        .join(" ");

    return (
        <div className="dashboard-chart-wrap">
            <svg className="dashboard-chart" viewBox="0 0 830 190" role="img" aria-label="Sample playtime trend over seven days">
                <defs>
                    <linearGradient id="playtime-fill" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#64b9f5" stopOpacity=".25" />
                        <stop offset="100%" stopColor="#64b9f5" stopOpacity="0" />
                    </linearGradient>
                </defs>
                {[36, 78, 120, 162].map((y) => (
                    <line key={y} x1="20" x2="810" y1={y} y2={y} className="chart-gridline" />
                ))}
                <polygon points={`28,174 ${points} 798,174`} fill="url(#playtime-fill)" />
                <polyline points={points} className="chart-line" />
                {playtimeTrend.map((value, index) => (
                    <circle
                        key={`${value}-${index}`}
                        cx={28 + index * 70}
                        cy={174 - value * 1.28}
                        r="3.5"
                        className="chart-point"
                    />
                ))}
            </svg>
            <div className="dashboard-chart-labels">
                {trendLabels.map((label) => <span key={label}>{label}</span>)}
            </div>
        </div>
    );
}

export function DashboardPage() {
    const { user } = useAuth();

    return (
        <div className="dashboard-page">
            <header className="dashboard-heading">
                <div>
                    <p className="dashboard-kicker">WORKSPACE OVERVIEW</p>
                    <h1>Welcome back, {user?.username ?? "Player"}</h1>
                    <p className="dashboard-description">A snapshot of the players and games you follow.</p>
                </div>
                <span className="dashboard-preview-badge"><span /> Preview data</span>
            </header>

            <section className="dashboard-metrics" aria-label="Workspace summary">
                <article className="dashboard-metric-card">
                    <span className="dashboard-metric-icon metric-blue"><UsersRound size={18} /></span>
                    <span className="dashboard-metric-label">Tracked players</span>
                    <strong>12</strong>
                    <span className="dashboard-metric-note">Across your workspace</span>
                </article>
                <article className="dashboard-metric-card">
                    <span className="dashboard-metric-icon metric-violet"><Gamepad2 size={18} /></span>
                    <span className="dashboard-metric-label">Games in library</span>
                    <strong>34</strong>
                    <span className="dashboard-metric-note">From tracked players</span>
                </article>
                <article className="dashboard-metric-card">
                    <span className="dashboard-metric-icon metric-cyan"><Clock3 size={18} /></span>
                    <span className="dashboard-metric-label">Total playtime</span>
                    <strong>2,846 <small>h</small></strong>
                    <span className="dashboard-metric-note">Combined tracked playtime</span>
                </article>
                <article className="dashboard-metric-card">
                    <span className="dashboard-metric-icon metric-green"><Activity size={18} /></span>
                    <span className="dashboard-metric-label">Last 2 weeks</span>
                    <strong>186 <small>h</small></strong>
                    <span className="dashboard-metric-note">Across all tracked games</span>
                </article>
            </section>

            <section className="dashboard-main-grid">
                <article className="dashboard-panel playtime-panel">
                    <div className="dashboard-panel-heading">
                        <div>
                            <h2>Playtime activity</h2>
                            <p>Hours recorded in recent snapshots</p>
                        </div>
                        <span className="dashboard-period">Last 7 days</span>
                    </div>
                    <TrendChart />
                </article>

                <article className="dashboard-panel sync-panel">
                    <div className="dashboard-panel-heading">
                        <div>
                            <h2>Recent syncs</h2>
                            <p>Latest player data refreshes</p>
                        </div>
                        <RefreshCw size={16} className="panel-heading-icon" />
                    </div>
                    <ul className="sync-list">
                        {recentSyncs.map((player) => (
                            <li className="sync-item" key={player.steamId}>
                                <span className="sync-avatar">{player.initials}</span>
                                <span className="sync-player-info">
                                    <strong>{player.name}</strong>
                                    <small>Steam profile updated</small>
                                </span>
                                <time>{player.time}</time>
                            </li>
                        ))}
                    </ul>
                    <p className="dashboard-data-note">Sync times come from player and game last-fetched timestamps.</p>
                </article>
            </section>

            <section className="dashboard-panel games-panel">
                <div className="dashboard-panel-heading">
                    <div>
                        <h2>Most played games</h2>
                        <p>Aggregated from tracked player game records</p>
                    </div>
                    <span className="dashboard-period">Your tracked players</span>
                </div>
                <div className="games-table" role="table" aria-label="Most played games">
                    <div className="games-table-head" role="row">
                        <span role="columnheader">Game</span>
                        <span role="columnheader">Players</span>
                        <span role="columnheader">Combined playtime</span>
                        <span role="columnheader">Last 2 weeks</span>
                    </div>
                    {popularGames.map((game) => (
                        <div className="games-table-row" role="row" key={game.name}>
                            <strong role="cell"><span className="game-dot" />{game.name}</strong>
                            <span role="cell">{game.players}</span>
                            <span role="cell">{game.hours}</span>
                            <span role="cell" className="game-change">{game.change}</span>
                        </div>
                    ))}
                </div>
            </section>

            <p className="dashboard-preview-note">This is a layout preview using sample values. Dashboard data will come from your player, game, and snapshot records.</p>
        </div>
    );
}
