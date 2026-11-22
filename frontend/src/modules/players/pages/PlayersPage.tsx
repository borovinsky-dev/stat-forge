
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { UserRound } from "lucide-react";

import { AddPlayerForm } from "../components/AddPlayerForm";
import { PlayerRow } from "../components/PlayerRow";
import { getPlayers } from "../services/players";
import type { PlayerResponse } from "../types/player";

import "./PlayersPage.css";

export function PlayersPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const isAddView = location.pathname === "/players/add";

    const [players, setPlayers] = useState<PlayerResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadPlayers = useCallback(async (signal?: AbortSignal) => {
        try {
            const data = await getPlayers(signal);

            if (signal?.aborted) {
                return;
            }

            setPlayers(data);
            setError("");
        } catch (err) {
            if (signal?.aborted) {
                return;
            }

            setError(
                err instanceof Error ? err.message : "Could not load players.",
            );
        } finally {
            if (!signal?.aborted) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();

        queueMicrotask(() => void loadPlayers(controller.signal));

        return () => controller.abort();
    }, [loadPlayers]);

    function handleAdded() {
        navigate("/players");
        void loadPlayers();
    }

    function handleRemoved(playerId: string) {
        setPlayers((current) => current.filter((p) => p.id !== playerId));
    }

    return (
        <main className="players-page">
            <div className="page-heading">
                <div className="heading-text">
                    <h1>Players</h1>

                    <p>
                        {isAddView
                            ? "Add a player to your Stat Forge database by their Steam ID."
                            : "Players you are currently tracking in Stat Forge."}
                    </p>
                </div>

                {!isAddView && (
                    <button
                        type="button"
                        className="add-player-button heading-action"
                        onClick={() => navigate("/players/add")}
                    >
                        <span className="button-icon">+</span>
                        Add Player
                    </button>
                )}
            </div>

            {isAddView ? (
                <section className="add-player-card">
                    <div className="card-divider" />

                    <div className="form-content">
                        <AddPlayerForm
                            onSuccess={handleAdded}
                            onCancel={() => navigate("/players")}
                        />
                    </div>
                </section>
            ) : (
                <section className="players-card">
                    {loading && (
                        <p className="players-hint">Loading players...</p>
                    )}

                    {!loading && error && (
                        <div className="players-error">
                            <p className="form-error">{error}</p>

                            <button
                                type="button"
                                className="back-button"
                                onClick={() => void loadPlayers()}
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {!loading && !error && players.length === 0 && (
                        <div className="players-empty">
                            <div className="empty-icon">
                                <UserRound size={34} strokeWidth={1.7} />
                            </div>

                            <h2>No players yet</h2>

                            <p>
                                Add your first player by Steam ID to start
                                tracking stats.
                            </p>

                            <button
                                type="button"
                                className="add-player-button"
                                onClick={() => navigate("/players/add")}
                            >
                                <span className="button-icon">+</span>
                                Add Player
                            </button>
                        </div>
                    )}

                    {!loading && !error && players.length > 0 && (
                        <div className="players-table">
                            <div className="players-table-head">
                                <span>Player</span>
                                <span>Steam ID</span>
                                <span>Country</span>
                                <span />
                            </div>

                            {players.map((player) => (
                                <PlayerRow
                                    key={player.id}
                                    player={player}
                                    onRemoved={handleRemoved}
                                />
                            ))}
                        </div>
                    )}
                </section>
            )}
        </main>
    );
}
