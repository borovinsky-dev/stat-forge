
import { useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router-dom";

import { Sidebar } from "./shared/components/Sidebar/Sidebar";
import { Topbar } from "./shared/components/Topbar/Topbar";
import { PlayersPage } from "./modules/players/pages/PlayersPage";
import { LogoLarge } from "./shared/components/LogoLarge/LogoLarge";

import "./App.css";

function DashboardPage() {
  return (
    <div className="players-page">
      <h1>Dashboard</h1>
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="players-page">
      <h1>Settings</h1>
    </div>
  );
}

function PlayerProfilePage() {
  const { steamId } = useParams();

  return (
    <div className="players-page">
      <h1>Player Profile</h1>
      <p>Steam ID: {steamId}</p>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="players-page">
      <h1>Page not found</h1>
    </div>
  );
}

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [logoAnimationKey, setLogoAnimationKey] = useState(0);

  const location = useLocation();

  const currentPage = (() => {
    if (location.pathname === "/dashboard") return "Dashboard";
    if (location.pathname === "/players/add") return "Add Player";
    if (location.pathname.startsWith("/players/")) return "Player Profile";
    if (location.pathname === "/players") return "Players";
    if (location.pathname === "/settings") return "Settings";

    return "Dashboard";
  })();

  const handleSidebarClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target;

    if (target instanceof Element && target.closest(".sidebar")) {
      setLogoAnimationKey((previous) => previous + 1);
    }
  };

  return (
    <div
      className={`app-layout ${sidebarCollapsed ? "sidebar-is-collapsed" : ""
        }`}
      onClickCapture={handleSidebarClick}
    >
      <LogoLarge key={logoAnimationKey} />

      <Sidebar
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      <div className="app-main">
        <Topbar currentPage={currentPage} />

        <main className="page-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route path="/dashboard" element={<DashboardPage />} />

            <Route path="/players" element={<PlayersPage />} />
            <Route path="/players/add" element={<PlayersPage />} />
            <Route path="/players/:steamId" element={<PlayerProfilePage />} />

            <Route path="/settings" element={<SettingsPage />} />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
