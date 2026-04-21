import AddTaskModal from "@/components/add-task-modal";
import AppShell from "@/components/app-shell";
import TaskCard from "@/components/TaskCard";
import { getViewerData } from "@/lib/taskflow-server";
import { getTaskCounts, sortTasksForFocus, toDateKey, toLocalDateKey } from "@/lib/taskflow";

export default async function TodayPage() {
  const { user, displayName, tasks } = await getViewerData();
  const counts = getTaskCounts(tasks);
  const todayKey = toDateKey(new Date());

  const todayDeadline = counts.active.filter(
    (task) => task.due_date && toLocalDateKey(task.due_date) === todayKey
  );
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
      pageLabel="Today board"
      pageTitle="Fokuskan hari ini ke hal yang benar-benar perlu selesai."
      pageDescription="Halaman ini merangkum prioritas utama, deadline yang dekat, dan sisa pekerjaan aktif tanpa bikin kepala penuh."
      actions={
        <div className="flex flex-wrap items-center gap-3 md:gap-4">
          <AddTaskModal />
        </div>
      }
    >
      <div className="space-y-8 md:space-y-10 pt-6 md:pt-8">
        <section className="stats-grid gap-5 md:gap-6">
          <div className="stat-card surface p-6 md:p-7">
            <p className="stat-label mb-4">Prioritas tinggi</p>
            <p className="stat-value is-danger">{priorityToday.length}</p>
          </div>

          <div className="stat-card surface p-6 md:p-7">
            <p className="stat-label mb-4">Deadline hari ini</p>
            <p className="stat-value is-warning">{todayDeadline.length}</p>
          </div>

          <div className="stat-card surface p-6 md:p-7">
            <p className="stat-label mb-4">Task aktif</p>
            <p className="stat-value">{counts.active.length}</p>
          </div>

          <div className="stat-card surface p-6 md:p-7">
            <p className="stat-label mb-4">Selesai</p>
            <p className="stat-value is-success">{counts.completed.length}</p>
          </div>
        </section>

        <section className="section-grid gap-6 md:gap-7">
          <div className="section-card surface-strong p-6 md:p-7">
            <div className="space-y-1.5">
              <h2 className="section-title">Prioritas utama</h2>
              <p className="section-copy">Task paling penting untuk didorong duluan.</p>
            </div>

            {priorityToday.length === 0 ? (
              <div className="empty-card surface mt-8 p-6">
                <p className="text-xl font-bold">Tidak ada prioritas tinggi.</p>
                <p>Hari ini masih longgar, kamu bisa ambil task dari daftar aktif biasa.</p>
              </div>
            ) : (
              <div className="task-grid two-col mt-8 gap-5 md:gap-6">
                {priorityToday.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            )}
          </div>

          <div className="section-card surface-strong p-6 md:p-7">
            <div className="space-y-1.5">
              <h2 className="section-title">Deadline hari ini</h2>
              <p className="section-copy">Yang butuh perhatian sebelum hari berganti.</p>
            </div>

            {todayDeadline.length === 0 ? (
              <div className="empty-card surface mt-8 p-6">
                <p className="text-xl font-bold">Aman untuk hari ini.</p>
                <p>Belum ada task jatuh tempo hari ini.</p>
              </div>
            ) : (
              <div className="task-grid two-col mt-8 gap-5 md:gap-6">
                {todayDeadline.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            )}
          </div>

          <div className="section-card surface-strong p-6 md:p-7">
            <div className="space-y-1.5">
              <h2 className="section-title">Task aktif lainnya</h2>
              <p className="section-copy">
                Sisa pekerjaan yang masih berjalan atau menunggu dikerjakan.
              </p>
            </div>

            {otherTasks.length === 0 ? (
              <div className="empty-card surface mt-8 p-6">
                <p className="text-xl font-bold">Semua sudah rapi.</p>
                <p>Task aktifmu sudah habis atau semuanya masuk prioritas utama.</p>
              </div>
            ) : (
              <div className="task-grid two-col mt-8 gap-5 md:gap-6">
                {otherTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}