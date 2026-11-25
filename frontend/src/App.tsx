
import { useState, type MouseEvent } from "react";
import {
  Navigate,
    Outlet,
  Route,
  Routes,
    useLocation,
} from "react-router-dom";

import { Sidebar } from "./shared/components/Sidebar/Sidebar";
import { Topbar } from "./shared/components/Topbar/Topbar";
import { PlayersPage } from "./modules/players/pages/PlayersPage";
import { PlayerProfilePage } from "./modules/players/pages/PlayerProfilePage";
import { SettingsPage } from "./modules/settings/pages/SettingsPage";
import { AccountPage } from "./modules/settings/pages/AccountPage";
import { SecurityPage } from "./modules/settings/pages/SecurityPage";
import { DashboardPage } from "./modules/dashboard/pages/DashboardPage";
import { LogoLarge } from "./shared/components/LogoLarge/LogoLarge";
import { AuthPage } from "./modules/auth/pages/AuthPage";
import { useAuth } from "./modules/auth/context/AuthContext";

import "./App.css";

function NotFoundPage() {
  return (
    <div className="content-page">
      <h1>Page not found</h1>
    </div>
  );
}

function RequireAuth() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") return <div className="auth-loading">Checking your session…</div>;
  if (status === "unauthenticated") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [logoAnimationKey, setLogoAnimationKey] = useState(0);

  const location = useLocation();

  const currentPage = (() => {
    if (location.pathname === "/dashboard") return "Dashboard";
    if (location.pathname === "/players/add") return "Add Player";
    if (location.pathname.startsWith("/players/")) return "Player Profile";
    if (location.pathname === "/players") return "Players";
    if (location.pathname === "/settings/account") return "Account";
    if (location.pathname === "/settings/security") return "Security";
    if (location.pathname === "/settings") return "Settings";

    return "Page not found";
  })();

  const handleSidebarClick = (event: MouseEvent<HTMLDivElement>) => {
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
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />

      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="players" element={<PlayersPage />} />
          <Route path="players/add" element={<PlayersPage />} />
          <Route path="players/:playerId" element={<PlayerProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="settings/account" element={<AccountPage />} />
          <Route path="settings/security" element={<SecurityPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
