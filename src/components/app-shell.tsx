import type { User } from "@supabase/supabase-js";
import AppNav from "@/components/app-nav";
import LogoutButton from "@/components/logout-button";
import { getMonogram } from "@/lib/taskflow";

type AppShellProps = {
  user: User;
  displayName: string;
  pageKey?: "dashboard" | "today" | "planner" | "focus" | "settings";
  pageLabel?: string;
  pageTitle?: string;
  pageDescription?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  heroMode?: "full" | "compact" | "hidden";
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
  heroMode = "full",
}: AppShellProps) {
  const email = user.email ?? "private@taskflow.local";

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="topbar-profile">
          <div className="identity-mark">{getMonogram(displayName)}</div>
          <div className="identity-meta">
            <strong>{displayName}</strong>
            <span>{email}</span>
          </div>
        </div>

        <AppNav />

        <div className="topbar-actions">
          <LogoutButton />
        </div>
      </header>

      {heroMode !== "hidden" ? (
        <section className="hero-panel">
          <div
            className={
              heroMode === "compact"
                ? "hero-copy hero-copy-compact"
                : `hero-copy hero-copy-${pageKey}`
            }
          >
            {pageLabel ? <p className="hero-label">{pageLabel}</p> : null}
            {heroMode === "full" ? <h1 className="hero-name">{displayName}</h1> : null}
            {pageTitle ? <h2 className="hero-title">{pageTitle}</h2> : null}
            {pageDescription ? <p className="hero-description">{pageDescription}</p> : null}
          </div>
        </section>
      ) : null}

      {actions ? <section className="page-actions">{actions}</section> : null}

      {children}
    </main>
  );
}
