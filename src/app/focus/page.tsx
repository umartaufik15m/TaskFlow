import DeepWorkModal from "@/components/deep-work-modal";
import AppShell from "@/components/app-shell";
import TaskCard from "@/components/TaskCard";
import { getViewerData } from "@/lib/taskflow-server";
import { getTaskCounts, sortTasksForFocus } from "@/lib/taskflow";

export default async function FocusPage() {
  const { user, displayName, tasks } = await getViewerData();
  const counts = getTaskCounts(tasks);
  const focusCandidates = sortTasksForFocus(counts.active).slice(0, 6);
  const inProgress = counts.progress.slice(0, 4);

  return (
    <AppShell
      user={user}
      displayName={displayName}
      pageKey="focus"
      pageLabel="Focus room"
      pageTitle="Masuk mode kerja dalam tanpa pindah-pindah konteks terlalu sering."
      pageDescription="Halaman ini memusatkan perhatian ke task yang layak dikerjakan sekarang, lalu memberi jalur cepat untuk mulai session fokus."
      actions={
        <div className="flex flex-wrap items-center gap-3 md:gap-4">
          <DeepWorkModal
            tasks={tasks.map((task) => ({
              id: task.id,
              title: task.title,
              status: task.status,
              is_completed: task.is_completed,
            }))}
          />
        </div>
      }
    >
      <div className="space-y-8 md:space-y-10 pt-6 md:pt-8">
        <section className="stats-grid gap-5 md:gap-6">
          <div className="stat-card surface p-6 md:p-7">
            <p className="stat-label mb-4">Kandidat fokus</p>
            <p className="stat-value">{focusCandidates.length}</p>
          </div>

          <div className="stat-card surface p-6 md:p-7">
            <p className="stat-label mb-4">Sedang jalan</p>
            <p className="stat-value is-warning">{counts.progress.length}</p>
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

        <section className="section-grid two-col gap-6 md:gap-7 items-start">
          <div className="section-card surface-strong p-6 md:p-7">
            <div className="space-y-1.5">
              <h2 className="section-title">Task terbaik untuk difokuskan</h2>
              <p className="section-copy">
                Diurutkan dari prioritas, deadline, lalu kapan task itu dibuat.
              </p>
            </div>

            {focusCandidates.length === 0 ? (
              <div className="empty-card surface mt-8 p-6">
                <p className="text-xl font-bold">Belum ada task aktif.</p>
                <p>Tambah task atau buka lagi task yang sebelumnya sudah selesai.</p>
              </div>
            ) : (
              <div className="task-grid mt-8 gap-5 md:gap-6">
                {focusCandidates.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            )}
          </div>

          <div className="section-card surface-strong p-6 md:p-7">
            <div className="space-y-1.5">
              <h2 className="section-title">Yang sudah mulai bergerak</h2>
              <p className="section-copy">
                Task berstatus in progress agar kamu tahu konteks yang lagi terbuka.
              </p>
            </div>

            {inProgress.length === 0 ? (
              <div className="empty-card surface mt-8 p-6">
                <p className="text-xl font-bold">Belum ada task in progress.</p>
                <p>Mulai satu session focus dan task yang dipilih akan ikut ditandai berjalan.</p>
              </div>
            ) : (
              <div className="task-grid mt-8 gap-5 md:gap-6">
                {inProgress.map((task) => (
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