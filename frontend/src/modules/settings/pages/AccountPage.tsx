import { useState, type FormEvent } from "react";
import { useAuth } from "../../auth/context/useAuth";
import { changePassword } from "../../auth/services/auth";
import "./SettingsPage.css";

export function AccountPage() {
    const { user, updateProfile } = useAuth();
    const [username, setUsername] = useState(user?.username ?? "");
    const [email, setEmail] = useState(user?.email ?? "");
    const [profileError, setProfileError] = useState("");
    const [profileMessage, setProfileMessage] = useState("");
    const [savingProfile, setSavingProfile] = useState(false);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [passwordMessage, setPasswordMessage] = useState("");
    const [savingPassword, setSavingPassword] = useState(false);

    async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setProfileError("");
        setProfileMessage("");
        setSavingProfile(true);

        try {
            const updatedUser = await updateProfile({ username: username.trim(), email: email.trim() });
            setUsername(updatedUser.username);
            setEmail(updatedUser.email);
            setProfileMessage("Account details updated.");
        } catch (cause) {
            setProfileError(cause instanceof Error ? cause.message : "Could not update account details.");
        } finally {
            setSavingProfile(false);
        }
    }

    async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setPasswordError("");
        setPasswordMessage("");

        if (newPassword !== confirmPassword) {
            setPasswordError("The new passwords do not match.");
            return;
        }

        setSavingPassword(true);
        try {
            await changePassword({ current_password: currentPassword, new_password: newPassword });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setPasswordMessage("Password changed.");
        } catch (cause) {
            setPasswordError(cause instanceof Error ? cause.message : "Could not change password.");
        } finally {
            setSavingPassword(false);
        }
    }

    return (
        <div className="settings-page">
            <header className="settings-heading">
                <h1>Account details</h1>
                <p>Update the information and password for your account.</p>
            </header>

            <section className="account-card" aria-labelledby="profile-details-title">
                <div className="account-card-heading">
                    <h2 id="profile-details-title">Profile details</h2>
                    <p>Change the name and email address associated with your account.</p>
                </div>
                <form className="account-form" onSubmit={handleProfileSubmit}>
                    <label className="account-field">
                        <span>Username</span>
                        <input
                            autoComplete="username"
                            required
                            minLength={5}
                            maxLength={50}
                            value={username}
                            onChange={(event) => setUsername(event.target.value)}
                        />
                    </label>
                    <label className="account-field">
                        <span>Email address</span>
                        <input
                            type="email"
                            autoComplete="email"
                            required
                            maxLength={255}
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                        />
                    </label>
                    {profileError && <p className="account-form-error" role="alert">{profileError}</p>}
                    {profileMessage && <p className="account-form-success" role="status">{profileMessage}</p>}
                    <button className="account-submit" type="submit" disabled={savingProfile}>
                        {savingProfile ? "Saving…" : "Save changes"}
                    </button>
                </form>
            </section>

            <section className="account-card" aria-labelledby="change-password-title">
                <div className="account-card-heading">
                    <h2 id="change-password-title">Change password</h2>
                    <p>Choose a new password between 8 and 16 characters.</p>
                </div>
                <form className="account-form" onSubmit={handlePasswordSubmit}>
                    <label className="account-field">
                        <span>Current password</span>
                        <input
                            type="password"
                            autoComplete="current-password"
                            required
                            value={currentPassword}
                            onChange={(event) => setCurrentPassword(event.target.value)}
                        />
                    </label>
                    <label className="account-field">
                        <span>New password</span>
                        <input
                            type="password"
                            autoComplete="new-password"
                            required
                            minLength={8}
                            maxLength={16}
                            value={newPassword}
                            onChange={(event) => setNewPassword(event.target.value)}
                        />
                    </label>
                    <label className="account-field">
                        <span>Confirm new password</span>
                        <input
                            type="password"
                            autoComplete="new-password"
                            required
                            minLength={8}
                            maxLength={16}
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                        />
                    </label>
                    {passwordError && <p className="account-form-error" role="alert">{passwordError}</p>}
                    {passwordMessage && <p className="account-form-success" role="status">{passwordMessage}</p>}
                    <button className="account-submit" type="submit" disabled={savingPassword}>
                        {savingPassword ? "Changing…" : "Change password"}
                    </button>
                </form>
            </section>
        </div>
    );
}
