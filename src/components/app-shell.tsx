import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import AppNav from "@/components/app-nav";
import LogoutButton from "@/components/logout-button";
import QuickAdd from "@/components/quick-add";
import { getMonogram } from "@/lib/taskflow";

type AppShellProps = {
  user: User;
  displayName: string;
  pageKey?: "home" | "tasks" | "goals" | "notes" | "money" | "settings";
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
  pageKey = "home",
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
        <div className="topbar-brand">
          <Link href="/" className="brand-logo" aria-label="Taskflow Home">
            <span>TASK</span>FLOW
          </Link>
        </div>

        <div className="topbar-center">
          <AppNav />
        </div>

        <div className="topbar-actions">
          <QuickAdd />
          <div className="topbar-profile">
            <Link href="/settings" className="profile-link" aria-label="Buka pengaturan">
              <div className="identity-mark">{getMonogram(displayName)}</div>
              <div className="identity-meta">
                <strong>{displayName}</strong>
                <span>{email}</span>
              </div>
            </Link>
          </div>
          <LogoutButton />
        </div>
      </header>

      {heroMode !== "hidden" ? (
        <section className={`hero-panel hero-panel-${pageKey}`}>
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
