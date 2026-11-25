import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

import { deletePlayer, syncPlayer, updatePlayer } from "../services/players";
import type { PlayerResponse } from "../types/player";
import defaultAvatar from "../../../assets/avatar/default-avatar.png";

interface PlayerRowProps {
    player: PlayerResponse;
    onRemoved: (playerId: string) => void;
    onUpdated?: (player: PlayerResponse) => void;
}

export function PlayerRow({ player, onRemoved, onUpdated }: PlayerRowProps) {
    const [currentPlayer, setCurrentPlayer] = useState(player);
    const [removing, setRemoving] = useState(false);
    const [updatingTracking, setUpdatingTracking] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [error, setError] = useState("");

    async function handleRemove() {
        try {
            setRemoving(true);
            setError("");
            await deletePlayer(player.id);
            onRemoved(player.id);
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : "Could not remove player.");
            setRemoving(false);
        }
    }

    async function handleTrackingToggle() {
        try {
            setUpdatingTracking(true);
            setError("");
            const updatedPlayer = await updatePlayer(player.id, {
                is_tracked: !currentPlayer.is_tracked,
            });
            setCurrentPlayer(updatedPlayer);
            onUpdated?.(updatedPlayer);
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : "Could not update tracking status.");
        } finally {
            setUpdatingTracking(false);
        }
    }

    async function handleSync() {
        try {
            setSyncing(true);
            setError("");
            const updatedPlayer = await syncPlayer(player.id);
            setCurrentPlayer(updatedPlayer);
            onUpdated?.(updatedPlayer);
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : "Could not sync player.");
        } finally {
            setSyncing(false);
        }
    }

    const isBusy = removing || updatingTracking || syncing;

    return (
        <div className="player-row">
            <div className="player-cell">
                <img
                    className="player-avatar"
                    src={currentPlayer.avatar_url || defaultAvatar}
                    alt={currentPlayer.username}
                    onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = defaultAvatar;
                    }}
                />
                <div className="player-meta">
                    <Link className="player-name player-details-link" to={`/players/${currentPlayer.id}`}>
                        {currentPlayer.username}
                    </Link>
                    {currentPlayer.profile_url && (
                        <a className="player-link" href={currentPlayer.profile_url} target="_blank" rel="noreferrer">
                            Open Steam profile
                        </a>
                    )}
                    {currentPlayer.last_fetched_at && (
                        <time className="player-sync-time" dateTime={currentPlayer.last_fetched_at}>
                            Synced {new Date(currentPlayer.last_fetched_at).toLocaleString()}
                        </time>
                    )}
                    {error && <span className="player-error">{error}</span>}
                </div>
            </div>

            <span className="player-steam-id">{currentPlayer.steam_id}</span>
            <span className="player-country">{currentPlayer.country_code ?? "—"}</span>

            <div className="player-actions">
                <button
                    type="button"
                    className="tracking-button"
                    onClick={handleSync}
                    disabled={isBusy}
                    title="Sync Steam profile"
                    aria-label="Sync Steam profile"
                >
                    {syncing ? <span className="tracking-spinner" /> : <RefreshCw size={16} />}
                </button>
                <button
                    type="button"
                    className={`tracking-button ${currentPlayer.is_tracked ? "is-tracked" : ""}`}
                    onClick={handleTrackingToggle}
                    disabled={isBusy}
                    title={currentPlayer.is_tracked ? "Stop tracking" : "Start tracking"}
                    aria-label={currentPlayer.is_tracked ? "Stop tracking" : "Start tracking"}
                >
                    {updatingTracking ? <span className="tracking-spinner" /> : <span className="tracking-check">✓</span>}
                </button>
                <button
                    type="button"
                    className="remove-button"
                    onClick={handleRemove}
                    disabled={isBusy}
                    title="Remove player"
                    aria-label="Remove player"
                >
                    {removing ? "…" : "×"}
                </button>
            </div>
        </div>
    );
}
