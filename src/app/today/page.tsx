import AppShell from "@/components/app-shell";
import TaskCard from "@/components/TaskCard";
import { getViewerData } from "@/lib/taskflow-server";
import { getDeadlineValue, getTaskCounts, sortTasksForFocus, toDateKey, toLocalDateKey } from "@/lib/taskflow";

export default async function TodayPage() {
  const { user, displayName, tasks, companies, categories } = await getViewerData();
  const counts = getTaskCounts(tasks);
  const todayKey = toDateKey(new Date());

  const todayDeadline = counts.active.filter((task) => {
    const deadline = getDeadlineValue(task);
    return task.has_deadline && deadline ? toLocalDateKey(deadline) === todayKey : false;
  });
  const priorityToday = sortTasksForFocus(counts.active)
    .filter((task) => task.priority === "high")
    .slice(0, 4);
  const otherTasks = counts.active.filter(
    (task) => !priorityToday.some((priorityTask) => priorityTask.id === task.id)
  );

  return (
    <AppShell
      user={user}
      displayName={displayName}
      pageKey="today"
      pageLabel="Today Board"
      pageTitle="Today Board"
      heroMode="compact"
    >
      <div className="space-y-6 pt-6">
        <section className="stats-grid compact-stats">
          <div className="stat-card surface">
            <p className="stat-label">Prioritas tinggi</p>
            <p className="stat-value is-danger">{priorityToday.length}</p>
          </div>

          <div className="stat-card surface">
            <p className="stat-label">Deadline hari ini</p>
            <p className="stat-value is-warning">{todayDeadline.length}</p>
          </div>

          <div className="stat-card surface">
            <p className="stat-label">Task aktif</p>
            <p className="stat-value">{counts.active.length}</p>
          </div>

          <div className="stat-card surface">
            <p className="stat-label">Selesai</p>
            <p className="stat-value is-success">{counts.completed.length}</p>
          </div>
        </section>

        <section className="section-grid gap-5">
          <div className="section-card surface-strong">
            <h2 className="section-title">Prioritas utama</h2>
            {priorityToday.length === 0 ? (
              <div className="empty-card surface mt-6">
                <p className="text-xl font-bold">Belum ada prioritas tinggi.</p>
              </div>
            ) : (
              <div className="task-grid mt-6">
                {priorityToday.map((task) => (
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

          <div className="section-card surface-strong">
            <h2 className="section-title">Deadline hari ini</h2>
            {todayDeadline.length === 0 ? (
              <div className="empty-card surface mt-6">
                <p className="text-xl font-bold">Belum ada deadline hari ini.</p>
              </div>
            ) : (
              <div className="task-grid mt-6">
                {todayDeadline.map((task) => (
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

          <div className="section-card surface-strong">
            <h2 className="section-title">Task lainnya</h2>
            {otherTasks.length === 0 ? (
              <div className="empty-card surface mt-6">
                <p className="text-xl font-bold">Tidak ada task lain untuk hari ini.</p>
              </div>
            ) : (
              <div className="task-grid mt-6">
                {otherTasks.map((task) => (
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
