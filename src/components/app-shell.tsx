import type { User } from "@supabase/supabase-js";
import AppNav from "@/components/app-nav";
import LiveDateTime from "@/components/live-date-time";
import LogoutButton from "@/components/logout-button";
import ThemeToggle from "@/components/ThemeToggle";
import { getMonogram } from "@/lib/taskflow";

type AppShellProps = {
  user: User;
  displayName: string;
  pageKey?: "dashboard" | "today" | "planner" | "focus" | "settings";
  pageLabel: string;
  pageTitle: string;
  pageDescription: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
};

export default function AppShell({
  user,
  displayName,
  pageKey = "dashboard",
  pageLabel,
  pageTitle,
  pageDescription,
  children,
  actions,
}: AppShellProps) {
  const email = user.email ?? "private@taskflow.local";

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark" aria-hidden="true" />
          <div>
            <p className="brand-kicker">Taskflow Personal Board</p>
            <p className="brand-title">For two people, one calm system.</p>
          </div>
        </div>

        <AppNav />

        <div className="topbar-actions">
          <ThemeToggle compact />
          <LogoutButton />
        </div>
      </header>

      <section className="hero-panel">
        <div className={`hero-copy hero-copy-${pageKey}`}>
          <p className="hero-label">{pageLabel}</p>
          <h1 className="hero-name">{displayName}</h1>
          <LiveDateTime />
          <h2 className="hero-title">{pageTitle}</h2>
          <p className="hero-description">{pageDescription}</p>
        </div>

        <div className="identity-card">
          <div className="identity-mark">{getMonogram(displayName)}</div>
          <div className="identity-meta">
            <span className="identity-caption">Akun aktif</span>
            <strong>{displayName}</strong>
            <span>{email}</span>
          </div>
        </div>
      </section>

      {actions ? <section className="page-actions">{actions}</section> : null}

      {children}
    </main>
  );
}
