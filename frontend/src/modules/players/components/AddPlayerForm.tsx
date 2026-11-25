import { useState, type FormEvent } from "react";
import { UserRound } from "lucide-react";

import { addPlayer } from "../services/players";
import { parseSteamInput } from "../utils/steamInput";
import type { PlayerCreate, PlayerInputMode } from "../types/player";
import "./AddPlayerForm.css";

interface AddPlayerFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export function AddPlayerForm({ onSuccess, onCancel }: AddPlayerFormProps) {
    const [mode, setMode] = useState<PlayerInputMode>("steam-id");
    const [input, setInput] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    function switchMode(nextMode: PlayerInputMode) {
        setMode(nextMode);
        setInput("");
        setError("");
    }

    async function handleAdd(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        const parsed = parseSteamInput(input);
        if (parsed.kind === "invalid") {
            setError(parsed.reason);
            return;
        }

        const payload: PlayerCreate = { steam_profile: input.trim() };
        setLoading(true);
        try {
            await addPlayer(payload);
            setInput("");
            onSuccess();
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : "Could not add this Steam profile.");
        } finally {
            setLoading(false);
        }
    }

    const isIdMode = mode === "steam-id";

    return (
        <form className="add-player-form" onSubmit={handleAdd}>
            <div className="mode-switcher" role="tablist">
                <button
                    type="button"
                    role="tab"
                    aria-selected={isIdMode}
                    className={`mode-tab ${isIdMode ? "active" : ""}`}
                    onClick={() => switchMode("steam-id")}
                    disabled={loading}
                >
                    Steam ID
                </button>
                <button
                    type="button"
                    role="tab"
                    aria-selected={!isIdMode}
                    className={`mode-tab ${!isIdMode ? "active" : ""}`}
                    onClick={() => switchMode("profile-url")}
                    disabled={loading}
                >
                    Profile URL
                </button>
            </div>

            <div className="form-field">
                <label htmlFor="player-input">{isIdMode ? "Steam ID" : "Profile URL"}</label>
                <p className="form-description">
                    {isIdMode
                        ? "Enter the player's 17-digit Steam ID."
                        : "Paste a steamcommunity.com profile link (profiles/... or id/...)."}
                </p>
                <div className="input-wrapper">
                    <UserRound className="input-icon" size={21} />
                    <input
                        id="player-input"
                        type="text"
                        inputMode={isIdMode ? "numeric" : "url"}
                        maxLength={isIdMode ? 17 : 500}
                        placeholder={isIdMode ? "76561198012345678" : "https://steamcommunity.com/id/..."}
                        value={input}
                        onChange={(event) => {
                            setInput(event.target.value);
                            setError("");
                        }}
                        disabled={loading}
                        required
                    />
                </div>
            </div>

            {error && <p className="form-error" role="alert">{error}</p>}

            <div className="preview-actions">
                <button type="button" className="back-button" onClick={onCancel} disabled={loading}>
                    Cancel
                </button>
                <button type="submit" className="add-player-button" disabled={loading || !input.trim()}>
                    <span className="button-icon">+</span>
                    {loading ? "Adding Player..." : "Add Player"}
                </button>
            </div>
        </form>
    );
}
