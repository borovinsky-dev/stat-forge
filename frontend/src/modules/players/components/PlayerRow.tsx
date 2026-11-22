
import { useState } from "react";

import {
    deletePlayer,
    updatePlayer,
} from "../services/players";

import type { PlayerResponse } from "../types/player";
import defaultAvatar from "../../../assets/avatar/default-avatar.png";

interface PlayerRowProps {
    player: PlayerResponse;
    onRemoved: (playerId: string) => void;
    onUpdated?: (player: PlayerResponse) => void;
}

export function PlayerRow({
    player,
    onRemoved,
    onUpdated,
}: PlayerRowProps) {
    const [removing, setRemoving] = useState(false);
    const [updatingTracking, setUpdatingTracking] = useState(false);
    const [isTracked, setIsTracked] = useState(player.is_tracked);
    const [error, setError] = useState("");

    async function handleRemove() {
        try {
            setRemoving(true);
            setError("");

            await deletePlayer(player.id);

            onRemoved(player.id);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Could not remove player.",
            );
            setRemoving(false);
        }
    }

    async function handleTrackingToggle() {
        try {
            setUpdatingTracking(true);
            setError("");

            const updatedPlayer = await updatePlayer(player.id, {
                is_tracked: !isTracked,
            });

            setIsTracked(updatedPlayer.is_tracked);
            onUpdated?.(updatedPlayer);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Could not update tracking status.",
            );
        } finally {
            setUpdatingTracking(false);
        }
    }

    return (
        <div className="player-row">
            <div className="player-cell">
                <img
                    className="player-avatar"
                    src={player.avatar_url || defaultAvatar}
                    alt={player.username}
                    onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = defaultAvatar;
                    }}
                />

                <div className="player-meta">
                    <span className="player-name">{player.username}</span>

                    {player.profile_url && (
                        <a
                            className="player-link"
                            href={player.profile_url}
                            target="_blank"
                            rel="noreferrer"
                        >
                            Open Steam profile
                        </a>
                    )}

                    {error && (
                        <span className="player-error">{error}</span>
                    )}
                </div>
            </div>

            <span className="player-steam-id">{player.steam_id}</span>

            <span className="player-country">
                {player.country_code ?? "—"}
            </span>

            <div className="player-actions">
                <button
                    type="button"
                    className={`tracking-button ${isTracked ? "is-tracked" : ""}`}
                    onClick={handleTrackingToggle}
                    disabled={updatingTracking || removing}
                    title={isTracked ? "Stop tracking" : "Start tracking"}
                    aria-label={isTracked ? "Stop tracking" : "Start tracking"}
                >
                    {updatingTracking ? (
                        <span className="tracking-spinner" />
                    ) : (
                        <span className="tracking-check">✓</span>
                    )}
                </button>

                <button
                    type="button"
                    className="remove-button"
                    onClick={handleRemove}
                    disabled={removing || updatingTracking}
                    title="Remove player"
                    aria-label="Remove player"
                >
                    {removing ? "…" : "×"}
                </button>
            </div>
        </div>
    );
}
