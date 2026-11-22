
import {
    Server,
    Database,
    LayoutDashboard,
    Settings,
    Users,
    PanelLeftClose,
    PanelLeftOpen,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import { LogoSmall } from "../LogoSmall/LogoSmall";

import "./Sidebar.css";

interface SidebarProps {
    collapsed: boolean;
    onCollapsedChange: (collapsed: boolean) => void;
}

export function Sidebar({
    collapsed,
    onCollapsedChange,
}: SidebarProps) {
    const navigation = [
        {
            label: "WORKSPACE",
            items: [
                {
                    name: "Dashboard",
                    path: "/dashboard",
                    icon: LayoutDashboard,
                },
                {
                    name: "Players",
                    path: "/players",
                    icon: Users,
                },
            ],
        },
        {
            label: "SYSTEM",
            items: [
                {
                    name: "Settings",
                    path: "/settings",
                    icon: Settings,
                },
            ],
        },
    ];

    return (
        <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
            <div className="sidebar-header">
                <div className="sidebar-brand">
                    <LogoSmall />

                    {!collapsed && (
                        <span className="sidebar-brand-name">
                            STAT FORGE
                        </span>
                    )}
                </div>

                <button
                    className="sidebar-collapse-button"
                    onClick={() => onCollapsedChange(!collapsed)}
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {collapsed ? (
                        <PanelLeftOpen size={18} />
                    ) : (
                        <PanelLeftClose size={18} />
                    )}
                </button>
            </div>

            <nav className="sidebar-navigation">
                {navigation.map((group) => (
                    <div className="sidebar-group" key={group.label}>
                        {!collapsed && (
                            <span className="sidebar-group-label">
                                {group.label}
                            </span>
                        )}

                        <div className="sidebar-items">
                            {group.items.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <NavLink
                                        to={item.path}
                                        key={item.name}
                                        end={item.path !== "/players"}
                                        className={({ isActive }) =>
                                            `sidebar-item ${isActive ? "active" : ""}`
                                        }
                                        title={collapsed ? item.name : undefined}
                                    >
                                        <Icon size={19} />

                                        {!collapsed && (
                                            <span>{item.name}</span>
                                        )}
                                    </NavLink>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            <div className="sidebar-footer">
                {!collapsed && (
                    <div className="sidebar-footer-heading">
                        <span>SYSTEM STATUS</span>

                        <span className="sidebar-status-overall">
                            Operational
                        </span>
                    </div>
                )}

                <div className="sidebar-status-list">
                    <div className="sidebar-status-item" title="API Server">
                        <div className="sidebar-status-label">
                            <Server size={15} />
                            {!collapsed && <span>API Server</span>}
                        </div>

                        {!collapsed && (
                            <span className="sidebar-status-value">
                                Online
                            </span>
                        )}
                    </div>

                    <div className="sidebar-status-item" title="PostgreSQL">
                        <div className="sidebar-status-label">
                            <Database size={15} />
                            {!collapsed && <span>PostgreSQL</span>}
                        </div>

                        {!collapsed && (
                            <span className="sidebar-status-value">
                                Connected
                            </span>
                        )}
                    </div>
                </div>

                {!collapsed && (
                    <div className="sidebar-footer-meta">
                        <span>Application</span>
                        <span>v0.1.0</span>
                    </div>
                )}
            </div>
        </aside>
    );
}
