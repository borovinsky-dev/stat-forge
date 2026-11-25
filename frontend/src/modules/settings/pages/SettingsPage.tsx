import { ArrowRight, ShieldCheck, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import "./SettingsPage.css";

export function SettingsPage() {
    return (
        <div className="settings-page">
            <header className="settings-heading">
                <h1>Settings</h1>
                <p>Manage your account and security settings.</p>
            </header>

            <section className="settings-section" aria-labelledby="account-settings-title">
                <h2 id="account-settings-title">Account</h2>
                <Link className="settings-link-card" to="/settings/account">
                    <span className="settings-link-icon"><UserRound size={21} /></span>
                    <span className="settings-link-copy">
                        <strong>Account details</strong>
                        <span>Update your username, email address, or password.</span>
                    </span>
                    <ArrowRight className="settings-link-arrow" size={18} />
                </Link>
            </section>

            <section className="settings-section" aria-labelledby="security-settings-title">
                <h2 id="security-settings-title">Security</h2>
                <Link className="settings-link-card" to="/settings/security">
                    <span className="settings-link-icon"><ShieldCheck size={21} /></span>
                    <span className="settings-link-copy">
                        <strong>Active sessions</strong>
                        <span>Review devices signed in to your account and end sessions you no longer use.</span>
                    </span>
                    <ArrowRight className="settings-link-arrow" size={18} />
                </Link>
            </section>
        </div>
    );
}
