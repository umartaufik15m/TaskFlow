import DeepWorkModal from "@/components/deep-work-modal";
import AppShell from "@/components/app-shell";
import TaskCard from "@/components/TaskCard";
import { getViewerData } from "@/lib/taskflow-server";
import { getTaskCounts, sortTasksForFocus } from "@/lib/taskflow";

export default async function FocusPage() {
  const { user, displayName, tasks, companies, categories } = await getViewerData();
  const counts = getTaskCounts(tasks);
  const workCandidates = sortTasksForFocus(
    counts.active.filter((task) => task.scope === "work")
  ).slice(0, 6);
  const inProgress = counts.progress.slice(0, 6);

  return (
    <AppShell
      user={user}
      displayName={displayName}
      pageKey="focus"
      pageLabel="Work"
      pageTitle="Work Board"
      heroMode="compact"
      actions={<DeepWorkModal tasks={tasks.map((task) => ({ id: task.id, title: task.title, status: task.status, is_completed: task.is_completed }))} />}
    >
      <div className="space-y-6 pt-6">
        <section className="stats-grid compact-stats">
          <div className="stat-card surface">
            <p className="stat-label">Kandidat kerja</p>
            <p className="stat-value">{workCandidates.length}</p>
          </div>

          <div className="stat-card surface">
            <p className="stat-label">Sedang progress</p>
            <p className="stat-value is-warning">{counts.progress.length}</p>
          </div>

          <div className="stat-card surface">
            <p className="stat-label">Task kerja aktif</p>
            <p className="stat-value">{counts.active.filter((task) => task.scope === "work").length}</p>
          </div>

          <div className="stat-card surface">
            <p className="stat-label">Timer fokus</p>
            <p className="stat-value is-success">On</p>
          </div>
        </section>

        <section className="section-grid two-col">
          <div className="section-card surface-strong">
            <div className="work-banner">
              <p className="hero-label">Mulai pekerjaan</p>
              <h2 className="section-title">Pindahkan task kerja ke in progress dari sini.</h2>
            </div>

            {workCandidates.length === 0 ? (
              <div className="empty-card surface mt-6">
                <p className="text-xl font-bold">Belum ada task kerja aktif.</p>
              </div>
            ) : (
              <div className="task-grid mt-6">
                {workCandidates.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    companies={companies}
                    categories={categories}
                    compact
                    showStartButton
                  />
                ))}
              </div>
            )}
          </div>

          <div className="section-card surface-strong">
            <p className="hero-label">Sedang progress</p>
            {inProgress.length === 0 ? (
              <div className="empty-card surface mt-6">
                <p className="text-xl font-bold">Belum ada task yang berjalan.</p>
                <p>Gunakan tombol mulai pekerjaan saat kamu siap masuk ke mode kerja aktif.</p>
              </div>
            ) : (
              <div className="task-grid mt-6">
                {inProgress.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    companies={companies}
                    categories={categories}
                    compact
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
