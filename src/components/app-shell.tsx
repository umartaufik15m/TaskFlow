import type { User } from "@supabase/supabase-js";
import AppNav from "@/components/app-nav";
import LiveDateTime from "@/components/live-date-time";
import LogoutButton from "@/components/logout-button";
import ThemeToggle from "@/components/ThemeToggle";
import { getMonogram } from "@/lib/taskflow";
import { Card, CardContent } from "@/components/ui/card";

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
  pageLabel,
  pageTitle,
  pageDescription,
  children,
  actions,
}: AppShellProps) {
  const email = user.email ?? "private@taskflow.local";

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl space-y-6 px-4 py-6 md:px-6 md:py-8">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[color:var(--card-border)] bg-[color:var(--card)] px-4 py-3 backdrop-blur">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--muted)]">Taskflow</p>
          <p className="text-sm font-semibold">For two people, one calm system.</p>
        </div>

        <AppNav />

        <div className="flex items-center gap-2">
          <ThemeToggle compact />
          <LogoutButton />
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-[1.4fr_0.6fr]">
        <Card>
          <CardContent className="p-6">
            <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--muted)]">{pageLabel}</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">{displayName}</h1>
            <LiveDateTime />
            <h2 className="mt-4 text-xl font-semibold">{pageTitle}</h2>
            <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">{pageDescription}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[color:var(--accent-soft)] text-lg font-bold">
              {getMonogram(displayName)}
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-[color:var(--muted)]">Akun aktif</p>
              <p className="mt-1 text-lg font-semibold">{displayName}</p>
              <p className="text-sm text-[color:var(--muted)] break-all">{email}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {actions ? <section className="flex flex-wrap gap-2">{actions}</section> : null}

      {children}
    </main>
  );
}
