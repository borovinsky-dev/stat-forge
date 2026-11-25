
import { ChevronRight, LogOut, Settings as SettingsIcon, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../modules/auth/context/AuthContext";

import "./Topbar.css";

interface TopbarProps {
    currentPage?: string;
}

export function Topbar({ currentPage = "Players" }: TopbarProps) {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const hasPlayersParent = currentPage === "Add Player" || currentPage === "Player Profile";
    const hasSettingsParent = currentPage === "Security" || currentPage === "Account";

    async function handleSignOut() {
        try {
            await signOut();
            navigate("/login", { replace: true });
        } catch {
            // Keep the signed-in view when the server could not revoke the session.
        }
    }

    return (
        <header className="topbar">
            <nav className="breadcrumbs" aria-label="Breadcrumb">
                {hasPlayersParent && (
                    <>
                        <Link className="breadcrumb-parent" to="/players">
                            <div className="breadcrumb-icon">
                                <Users size={15} />
                            </div>
                            <span>Players</span>
                        </Link>
                        <ChevronRight className="breadcrumb-separator" size={15} />
                    </>
                )}
                {hasSettingsParent && (
                    <>
                        <Link className="breadcrumb-parent" to="/settings">
                            <div className="breadcrumb-icon">
                                <SettingsIcon size={15} />
                            </div>
                            <span>Settings</span>
                        </Link>
                        <ChevronRight className="breadcrumb-separator" size={15} />
                    </>
                )}
                <span className="breadcrumb-current">
                    {currentPage}
                </span>
            </nav>

            <div className="topbar-account">
                <span className="topbar-username">{user?.username}</span>
                <button className="topbar-profile" type="button" title="Sign out" aria-label="Sign out" onClick={handleSignOut}>
                    <LogOut size={16} />
                </button>
            </div>
        </header>
    );
}
