import AddTaskModal from "@/components/add-task-modal";
import AppShell from "@/components/app-shell";
import TodayTabs from "@/components/today-tabs";
import { Card, CardContent } from "@/components/ui/card";
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
      pageDescription="Tiga area inti: prioritas, deadline hari ini, dan task aktif lainnya."
      actions={<AddTaskModal />}
    >
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-[color:var(--muted)]">Prioritas tinggi</p>
            <p className="mt-2 text-4xl font-black text-[color:var(--danger)]">{priorityToday.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-[color:var(--muted)]">Deadline hari ini</p>
            <p className="mt-2 text-4xl font-black text-[color:var(--warning)]">{todayDeadline.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-[color:var(--muted)]">Task aktif</p>
            <p className="mt-2 text-4xl font-black">{counts.active.length}</p>
          </CardContent>
        </Card>
      </section>

      <TodayTabs
        priorityToday={priorityToday}
        todayDeadline={todayDeadline}
        otherTasks={otherTasks}
      />
    </AppShell>
  );
}
