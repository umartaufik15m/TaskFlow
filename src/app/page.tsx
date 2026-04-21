import Link from "next/link";
import AddTaskModal from "@/components/add-task-modal";
import AppShell from "@/components/app-shell";
import DeepWorkModal from "@/components/deep-work-modal";
import EmptyState from "@/components/empty-state";
import TaskCalendar from "@/components/task-calendar";
import TaskCard from "@/components/TaskCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
      pageDescription="Ringkas, cepat, dan enak dilihat saat dipakai lama."
      actions={
        <>
          <AddTaskModal />
          <DeepWorkModal
            tasks={tasks.map((task) => ({
              id: task.id,
              title: task.title,
              status: task.status,
              is_completed: task.is_completed,
            }))}
          />
          <Button variant="secondary" asChild>
            <Link href="/planner">Buka planner</Link>
          </Button>
        </>
      }
    >
      <section className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="p-5"><p className="text-sm text-[color:var(--muted)]">Deadline hari ini</p><p className="mt-2 text-4xl font-black text-[color:var(--danger)]">{counts.dueToday.length}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-[color:var(--muted)]">Task aktif</p><p className="mt-2 text-4xl font-black">{counts.active.length}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-[color:var(--muted)]">Sedang jalan</p><p className="mt-2 text-4xl font-black text-[color:var(--warning)]">{counts.progress.length}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-[color:var(--muted)]">Selesai</p><p className="mt-2 text-4xl font-black text-[color:var(--success)]">{counts.completed.length}</p></CardContent></Card>
      </section>

      <section className="grid items-start gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>Task list</CardTitle>
                <p className="mt-1 text-sm text-[color:var(--muted)]">
                  Menampilkan {filteredTasks.length} dari {tasks.length} task.
                </p>
              </div>
              {selectedDate ? (
                <span className="rounded-full border border-[color:var(--card-border)] px-3 py-1 text-xs">
                  {formatDateLabel(selectedDate)}
                </span>
              ) : null}
            </div>
          </CardHeader>

          <CardContent>
            <form method="GET" className="grid gap-3 md:grid-cols-2">
              <Input type="text" name="q" defaultValue={params.q ?? ""} placeholder="Cari judul atau catatan" />

              <Input type="date" name="date" defaultValue={selectedDate} />

              <select name="status" defaultValue={params.status ?? "all"} className="h-11 rounded-xl border border-[color:var(--card-border)] bg-transparent px-3 text-sm">
                <option value="all">Semua status</option>
                <option value="todo">To do</option>
                <option value="progress">In progress</option>
                <option value="done">Done</option>
              </select>

              <select name="priority" defaultValue={params.priority ?? "all"} className="h-11 rounded-xl border border-[color:var(--card-border)] bg-transparent px-3 text-sm">
                <option value="all">Semua prioritas</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>

              <select name="type" defaultValue={params.type ?? "all"} className="h-11 rounded-xl border border-[color:var(--card-border)] bg-transparent px-3 text-sm md:col-span-2">
                <option value="all">Semua jenis</option>
                <option value="task">Task</option>
                <option value="daily">Daily</option>
                <option value="project">Project</option>
                <option value="event">Event</option>
                <option value="reminder">Reminder</option>
              </select>

              <div className="flex flex-wrap justify-end gap-2 md:col-span-2">
                {hasFilter ? (
                  <Button variant="secondary" asChild>
                    <Link href="/">Reset</Link>
                  </Button>
                ) : null}
                <Button type="submit">Terapkan</Button>
              </div>
            </form>

            <div className="mt-6">
              {filteredTasks.length === 0 ? (
                <EmptyState
                  title="Belum ada hasil yang cocok"
                  description="Ubah filter atau tambah task baru biar daftar ini terisi."
                />
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                  {filteredTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

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
      </section>
    </AppShell>
  );
}
