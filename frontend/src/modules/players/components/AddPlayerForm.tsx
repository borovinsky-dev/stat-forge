import { useState } from "react";
import { addPlayer } from "../services/players";
import { buildProfileUrl, resolveSteamPlayer, SteamApiError } from "../services/steam";
import type { ResolvedPlayer } from "../services/steam";
import { parseSteamInput } from "../utils/steamInput";
import type { PlayerCreate, PlayerInputMode } from "../types/player";
import "./AddPlayerForm.css";
import { UserRound } from "lucide-react";
import defaultAvatar from "../../../assets/avatar/default-avatar.png"


interface AddPlayerFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export function AddPlayerForm({ onSuccess, onCancel }: AddPlayerFormProps) {
    const [mode, setMode] = useState<PlayerInputMode>("steam-id");
    const [input, setInput] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [resolved, setResolved] = useState<ResolvedPlayer | null>(null);

    function switchMode(nextMode: PlayerInputMode) {
        if (nextMode === mode) {
            return;
        }

        setMode(nextMode);
        setInput("");
        setError("");
        setResolved(null);
    }

    async function handleResolve(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        const parsed = parseSteamInput(input);

        if (parsed.kind === "invalid") {
            setError(parsed.reason);
            return;
        }

        if (parsed.kind === "vanity") {
            setError(
                "Vanity URLs are not supported yet. Paste a steamcommunity.com/profiles/... link with the 17-digit ID.",
            );
            return;
        }

        try {
            setLoading(true);

            const player = await resolveSteamPlayer(parsed.steamId);

            setResolved(player);
        } catch (err) {
            setError(
                err instanceof SteamApiError
                    ? err.message
                    : "Something went wrong while contacting Steam.",
            );
        } finally {
            setLoading(false);
        }
    }

    async function handleAdd() {
        if (resolved === null) {
            return;
        }

        setError("");

        const playerData: PlayerCreate = {
            steam_id: resolved.steam_id,
            username: resolved.username,
            avatar_url: resolved.avatar_url,
            profile_url: resolved.profile_url ?? buildProfileUrl(resolved.steam_id),
            country_code: resolved.country_code,
        };

        try {
            setLoading(true);

            await addPlayer(playerData);

            setResolved(null);
            setInput("");
            onSuccess();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong.",
            );
        } finally {
            setLoading(false);
        }
    }

    const isIdMode = mode === "steam-id";

    return (
        <form className="add-player-form" onSubmit={handleResolve}>
            <div className="mode-switcher" role="tablist">
                <button
                    type="button"
                    role="tab"
                    aria-selected={isIdMode}
                    className={`mode-tab ${isIdMode ? "active" : ""}`}
                    onClick={() => switchMode("steam-id")}
                >
                    Steam ID
                </button>

                <button
                    type="button"
                    role="tab"
                    aria-selected={!isIdMode}
                    className={`mode-tab ${!isIdMode ? "active" : ""}`}
                    onClick={() => switchMode("profile-url")}
                >
                    Profile URL
                </button>
            </div>

            {resolved === null ? (
                <>
                    <div className="form-field">
                        <label htmlFor="player-input">
                            {isIdMode ? "Steam ID" : "Profile URL"}
                        </label>

                        <p className="form-description">
                            {isIdMode
                                ? "Enter the 17-digit Steam ID of the player."
                                : "Paste a steamcommunity.com profile link (profiles/... or id/...)."}
                        </p>

                        <div className="input-wrapper">
                            <UserRound className="input-icon" size={21} />
                            <input
                                id="player-input"
                                type="text"
                                inputMode={isIdMode ? "numeric" : "url"}
                                maxLength={isIdMode ? 17 : 200}
                                placeholder={
                                    isIdMode
                                        ? "76561198012345678"
                                        : "https://steamcommunity.com/id/..."
                                }
                                value={input}
                                onChange={(event) => {
                                    setInput(event.target.value);
                                    setError("");
                                }}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {error && <p className="form-error">{error}</p>}

                    <button
                        type="submit"
                        className="add-player-button"
                        disabled={loading || !input.trim()}
                    >
                        <span className="button-icon">+</span>
                        {loading ? "Searching..." : "Find Player"}
                    </button>
                </>
            ) : (
                <>
                    <div className="player-preview">
                        <img
                            className="preview-avatar"
                            src={resolved.avatar_url || defaultAvatar}
                            alt={resolved.username}
                            onError={(event) => {
                                event.currentTarget.onerror = null;
                                event.currentTarget.src = defaultAvatar;
                            }}
                        />

                        <div className="preview-info">
                            <span className="preview-name">
                                {resolved.username}
                            </span>

                            <span className="preview-id">
                                {resolved.steam_id}
                            </span>
                        </div>
                    </div>

                    {error && <p className="form-error">{error}</p>}

                    <div className="preview-actions">
                        <button
                            type="button"
                            className="back-button"
                            onClick={onCancel}
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            className="add-player-button"
                            onClick={handleAdd}
                            disabled={loading}
                        >
                            <span className="button-icon">+</span>
                            {loading ? "Adding Player..." : "Add Player"}
                        </button>
                    </div>
                </>
            )}
        </form>
    );
}