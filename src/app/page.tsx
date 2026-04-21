import Link from "next/link";
import type { CSSProperties } from "react";
import LiveDateTime from "@/components/live-date-time";
import LogoutButton from "@/components/logout-button";
import { getViewerData } from "@/lib/taskflow-server";
import {
  getCompanyDistribution,
  getScheduleValue,
  getMonthlyCompletion,
  sortTasksForFocus,
  toDateKey,
} from "@/lib/taskflow";

export default async function HomePage() {
  const { displayName, tasks, companies, categories } = await getViewerData();
  const monthlyCompletion = getMonthlyCompletion(tasks);
  const companyDistribution = getCompanyDistribution(tasks, companies).slice(0, 6);
  const activeTasks = tasks.filter((task) => !task.is_completed && task.status !== "done");
  const topCategories = [...new Set(tasks.map((task) => task.category_name).filter(Boolean))].slice(0, 3);
  const upcomingTasks = sortTasksForFocus(activeTasks).slice(0, 3);
  const currentMonthProgress = monthlyCompletion.at(-1);
  const completionPercent = currentMonthProgress
    ? Math.round((currentMonthProgress.completed / Math.max(currentMonthProgress.total, 1)) * 100)
    : 0;
  const completionStyle = { "--completion": completionPercent } as CSSProperties;
  const todayLabel = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <main className="dashboard-cinematic">
      <aside className="dashboard-side surface-strong">
        <div>
          <h1 className="dashboard-brand">TaskFlow</h1>
          <p className="dashboard-brand-sub">CINEMATIC EMBER</p>
        </div>

        <nav className="dashboard-side-nav">
          <Link href="/" className="is-active">Dashboard</Link>
          <Link href="/today">Today</Link>
          <Link href="/planner">Planner</Link>
          <Link href="/focus">Work</Link>
          <Link href="/settings">Settings</Link>
        </nav>

        <div className="dashboard-side-footer">
          <Link href="/settings">Settings</Link>
          <LogoutButton />
        </div>

        <Link href="/planner" className="btn-primary dashboard-new-task">
          + New Task
        </Link>
      </aside>

      <section className="dashboard-main">
        <header className="dashboard-main-header">
          <div>
            <p className="dashboard-date">{todayLabel}</p>
            <h2 className="dashboard-greeting">
              Good morning, <span>{displayName.split(" ")[0] ?? "User"}</span>
            </h2>
          </div>
          <button className="btn-secondary">Download Report</button>
        </header>

        <section className="dashboard-stats-row">
          <article className="section-card surface stat-box">
            <p>Total Tasks</p>
            <strong>{tasks.length}</strong>
          </article>
          <article className="section-card surface stat-box">
            <p>Active Companies</p>
            <strong>{companyDistribution.length}</strong>
          </article>
          <article className="section-card surface stat-box">
            <p>Top Categories</p>
            <div className="dashboard-tags">
              {topCategories.length === 0 ? <span>Belum ada</span> : null}
              {topCategories.map((category) => (
                <span key={category}>{category}</span>
              ))}
            </div>
          </article>
        </section>

        <section className="dashboard-lower-grid">
          <article className="section-card surface-strong">
            <div className="dash-section-head">
              <h3>Upcoming Schedule</h3>
              <Link href="/planner">View Full Calendar</Link>
            </div>
            <div className="dash-schedule-list">
              {upcomingTasks.length === 0 ? (
                <p className="section-copy">Belum ada jadwal terdekat.</p>
              ) : (
                upcomingTasks.map((task) => (
                  <div key={task.id} className="dash-schedule-item">
                    <div className="dash-schedule-date">{toDateKey(new Date(getScheduleValue(task) ?? new Date())).slice(5)}</div>
                    <div>
                      <strong>{task.title}</strong>
                      <p>{task.company_name ?? "Taskflow"} · {task.category_name ?? "Task"}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>

          <article className="section-card surface-strong dashboard-review-panel">
            <h3>Dashboard Review</h3>
            <div className="dashboard-review-ring" style={completionStyle}>
              <span>{completionPercent}%</span>
              <small>Completed</small>
            </div>
            <div className="dashboard-progress-list">
              <div><span>Total task</span><strong>{tasks.length}</strong></div>
              <div><span>Kategori aktif</span><strong>{categories.length}</strong></div>
              <div><span>Task aktif</span><strong>{activeTasks.length}</strong></div>
            </div>
          </article>
        </section>

        <section className="section-card surface-strong mt-6">
          <p className="hero-label">Jam saat ini</p>
          <LiveDateTime />
        </section>
      </section>
    </main>
  );
}
