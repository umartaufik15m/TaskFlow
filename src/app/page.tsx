import LiveDateTime from "@/components/live-date-time";
import AppShell from "@/components/app-shell";
import DashboardReview from "@/components/dashboard-review";
import TaskCalendar from "@/components/task-calendar";
import { getViewerData } from "@/lib/taskflow-server";
import {
  getCompanyDistribution,
  getDailyCategorySummaries,
  getMonthlyCompletion,
} from "@/lib/taskflow";

export default async function HomePage() {
  const { user, displayName, tasks, companies, categories } = await getViewerData();
  const monthlyCompletion = getMonthlyCompletion(tasks);
  const companyDistribution = getCompanyDistribution(tasks, companies).slice(0, 6);
  const dailySummaries = getDailyCategorySummaries(tasks, categories, 7);
  const latestMonth = monthlyCompletion.at(-1)?.monthKey;

  return (
    <AppShell user={user} displayName={displayName} pageKey="dashboard" heroMode="hidden">
      <div className="dashboard-grid">
        <section className="section-card surface-strong">
          <p className="hero-label">Hari ini</p>
          <LiveDateTime />
        </section>

        <section className="section-card surface-strong dashboard-date-card">
          <p className="hero-label">Ringkasan</p>
          <div className="dashboard-mini-stats">
            <div className="dashboard-mini-stat surface">
              <span>Total task</span>
              <strong>{tasks.length}</strong>
            </div>
            <div className="dashboard-mini-stat surface">
              <span>Perusahaan</span>
              <strong>{companyDistribution.length}</strong>
            </div>
            <div className="dashboard-mini-stat surface">
              <span>Kategori aktif</span>
              <strong>{categories.length}</strong>
            </div>
          </div>
        </section>

        <section className="dashboard-panel-wide">
          <TaskCalendar tasks={tasks} initialMonthKey={latestMonth} mode="dashboard" />
        </section>

        <DashboardReview
          monthlyCompletion={monthlyCompletion}
          companyDistribution={companyDistribution}
          dailySummaries={dailySummaries}
        />
      </div>
    </AppShell>
  );
}
