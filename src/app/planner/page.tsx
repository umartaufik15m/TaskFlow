import AddTaskModal from "@/components/add-task-modal";
import AppShell from "@/components/app-shell";
import TaskCalendar from "@/components/task-calendar";
import TaskCard from "@/components/TaskCard";
import { getViewerData } from "@/lib/taskflow-server";
import { filterTasks, formatDateLabel, sortTasksForFocus } from "@/lib/taskflow";

type SearchParams = Promise<{
  date?: string;
}>;

export default async function PlannerPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const selectedDate = (params.date ?? "").trim();
  const { user, displayName, tasks } = await getViewerData();
  const pickedTasks = filterTasks(tasks, { date: selectedDate });
  const upcoming = sortTasksForFocus(
    tasks.filter((task) => !task.is_completed && task.status !== "done" && task.due_date)
  ).slice(0, 8);

  return (
    <AppShell
      user={user}
      displayName={displayName}
      pageLabel="Planner"
      pageTitle="Lihat bulan ini, pilih tanggal, dan atur beban kerja lebih tenang."
      pageDescription="Planner dibuat untuk melihat ritme deadline dan agenda. Cocok saat kamu mau ngerapikan minggu tanpa menatap daftar task mentah."
      actions={<AddTaskModal />}
    >
      <section className="section-grid two-col">
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

        <div className="section-card surface-strong">
          <h2 className="section-title">
            {selectedDate ? `Task pada ${formatDateLabel(selectedDate)}` : "Task terdekat"}
          </h2>
          <p className="section-copy">
            {selectedDate
              ? "Task yang jatuh pada tanggal yang kamu pilih."
              : "Delapan task aktif dengan deadline terdekat atau prioritas paling tinggi."}
          </p>

          {(selectedDate ? pickedTasks : upcoming).length === 0 ? (
            <div className="empty-card surface mt-6">
              <p className="text-xl font-bold">Belum ada agenda yang tampil.</p>
              <p>Tambahkan task dengan tanggal agar planner ini lebih hidup.</p>
            </div>
          ) : (
            <div className="task-grid mt-6">
              {(selectedDate ? pickedTasks : upcoming).map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}
