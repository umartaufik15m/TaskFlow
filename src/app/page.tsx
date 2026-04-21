import Link from "next/link";
import AddTaskModal from "@/components/add-task-modal";
import AppShell from "@/components/app-shell";
import DeepWorkModal from "@/components/deep-work-modal";
import TaskCalendar from "@/components/task-calendar";
import TaskCard from "@/components/TaskCard";
import { getViewerData } from "@/lib/taskflow-server";
import { filterTasks, formatDateLabel, getTaskCounts } from "@/lib/taskflow";

type SearchParams = Promise<{
  q?: string;
  status?: string;
  priority?: string;
  type?: string;
  date?: string;
}>;

export default async function HomePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const { user, displayName, tasks } = await getViewerData();
  const filteredTasks = filterTasks(tasks, params);
  const counts = getTaskCounts(tasks);
  const selectedDate = (params.date ?? "").trim();

  const hasFilter =
    Boolean((params.q ?? "").trim()) ||
    (params.status ?? "all") !== "all" ||
    (params.priority ?? "all") !== "all" ||
    (params.type ?? "all") !== "all" ||
    Boolean(selectedDate);

  return (
    <AppShell
      user={user}
      displayName={displayName}
      pageKey="dashboard"
      pageLabel="Dashboard utama"
      pageTitle="Satu tempat untuk kerja, janji, dan hal penting sehari-hari."
      pageDescription="Board ini dibuat untuk dipakai harian. Ringkas, cepat, dan tetap enak dilihat saat dipakai lama."
      actions={
        <div className="flex flex-wrap items-center gap-3 md:gap-4">
          <AddTaskModal />
          <DeepWorkModal
            tasks={tasks.map((task) => ({
              id: task.id,
              title: task.title,
              status: task.status,
              is_completed: task.is_completed,
            }))}
          />
          <Link href="/planner" className="btn-secondary">
            Buka planner
          </Link>
        </div>
      }
    >
      <div className="space-y-8 md:space-y-10 pt-6 md:pt-8">
        <section className="stats-grid gap-5 md:gap-6">
          <div className="stat-card surface p-6 md:p-7">
            <p className="stat-label mb-4">Deadline hari ini</p>
            <p className="stat-value is-danger">{counts.dueToday.length}</p>
          </div>

          <div className="stat-card surface p-6 md:p-7">
            <p className="stat-label mb-4">Task aktif</p>
            <p className="stat-value">{counts.active.length}</p>
          </div>

          <div className="stat-card surface p-6 md:p-7">
            <p className="stat-label mb-4">Sedang jalan</p>
            <p className="stat-value is-warning">{counts.progress.length}</p>
          </div>

          <div className="stat-card surface p-6 md:p-7">
            <p className="stat-label mb-4">Selesai</p>
            <p className="stat-value is-success">{counts.completed.length}</p>
          </div>
        </section>

        <section className="section-grid two-col gap-6 md:gap-7 items-start">
          <div className="section-card surface-strong p-6 md:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4 md:gap-5">
              <div className="space-y-1.5">
                <h2 className="section-title">Task list</h2>
                <p className="section-copy">
                  Menampilkan {filteredTasks.length} dari {tasks.length} task.
                </p>
              </div>

              {selectedDate ? (
                <div className="badge is-progress">{formatDateLabel(selectedDate)}</div>
              ) : null}
            </div>

            <form method="GET" className="inline-form mt-8">
              <div className="field">
                <label htmlFor="search-task">Cari task</label>
                <input
                  id="search-task"
                  type="text"
                  name="q"
                  defaultValue={params.q ?? ""}
                  placeholder="Cari judul atau catatan"
                  className="field-input"
                />
              </div>

              <div className="field-group two-col gap-4 md:gap-5">
                <div className="field">
                  <label htmlFor="filter-status">Status</label>
                  <select
                    id="filter-status"
                    name="status"
                    defaultValue={params.status ?? "all"}
                    className="field-select"
                  >
                    <option value="all">Semua status</option>
                    <option value="todo">To do</option>
                    <option value="progress">In progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="filter-priority">Prioritas</label>
                  <select
                    id="filter-priority"
                    name="priority"
                    defaultValue={params.priority ?? "all"}
                    className="field-select"
                  >
                    <option value="all">Semua prioritas</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="field-group two-col gap-4 md:gap-5">
                <div className="field">
                  <label htmlFor="filter-type">Jenis</label>
                  <select
                    id="filter-type"
                    name="type"
                    defaultValue={params.type ?? "all"}
                    className="field-select"
                  >
                    <option value="all">Semua jenis</option>
                    <option value="task">Task</option>
                    <option value="daily">Daily</option>
                    <option value="project">Project</option>
                    <option value="event">Event</option>
                    <option value="reminder">Reminder</option>
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="filter-date">Tanggal</label>
                  <input
                    id="filter-date"
                    type="date"
                    name="date"
                    defaultValue={selectedDate}
                    className="field-input"
                  />
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-3 pt-2">
                {hasFilter ? (
                  <Link href="/" className="btn-secondary">
                    Reset
                  </Link>
                ) : null}
                <button type="submit" className="btn-primary">
                  Terapkan
                </button>
              </div>
            </form>

            {filteredTasks.length === 0 ? (
              <div className="empty-card surface mt-8 p-6">
                <p className="text-xl font-bold">Belum ada hasil yang cocok.</p>
                <p>Ubah filter atau tambah task baru biar daftar ini terisi.</p>
              </div>
            ) : (
              <div className="task-grid two-col mt-8 gap-5 md:gap-6">
                {filteredTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            )}
          </div>

          <div className="self-start">
            <TaskCalendar
              tasks={tasks.map((task) => ({
                id: task.id,
                title: task.title,
                due_date: task.due_date,
                priority: task.priority,
                status: task.status,
                is_completed: task.is_completed,
              }))}
              selectedDate={selectedDate}
            />
          </div>
        </section>
      </div>
    </AppShell>
  );
}