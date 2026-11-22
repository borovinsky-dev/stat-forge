
import { ChevronRight, Users } from "lucide-react";

import "./Topbar.css";

interface TopbarProps {
    currentPage?: string;
}

export function Topbar({ currentPage = "Players" }: TopbarProps) {
    const isNestedPage = currentPage !== "Players";

    return (
        <header className="topbar">
            <nav className="breadcrumbs" aria-label="Breadcrumb">
                {isNestedPage && (
                    <>
                        <div className="breadcrumb-parent">
                            <div className="breadcrumb-icon">
                                <Users size={15} />
                            </div>

                            <span>Players</span>
                        </div>

                        <ChevronRight
                            className="breadcrumb-separator"
                            size={15}
                        />
                    </>
                )}

                <span className="breadcrumb-current">
                    {currentPage}
                </span>
            </nav>

            <div className="topbar-profile" title="StatForge">
                SF
            </div>
        </header>
    );
}
