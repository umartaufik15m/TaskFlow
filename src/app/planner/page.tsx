import AddTaskModal from "@/components/add-task-modal";
import AppShell from "@/components/app-shell";
import EmptyState from "@/components/empty-state";
import TaskCalendar from "@/components/task-calendar";
import TaskCard from "@/components/TaskCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
      pageKey="planner"
      pageLabel="Planner"
      pageTitle="Lihat bulan ini, pilih tanggal, dan atur beban kerja lebih tenang."
      pageDescription="Pilih tanggal lalu eksekusi task yang paling penting tanpa keramaian UI."
      actions={<AddTaskModal />}
    >
      <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
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

        <Card>
          <CardHeader>
            <CardTitle>{selectedDate ? `Task pada ${formatDateLabel(selectedDate)}` : "Task Planner"}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={selectedDate ? "selected" : "upcoming"}>
              <TabsList>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="selected">Selected Date</TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="space-y-4">
                {upcoming.length === 0 ? (
                  <EmptyState
                    title="Belum ada task terjadwal"
                    description="Tambahkan due date agar planner bisa menyusun prioritasmu."
                  />
                ) : (
                  <div className="grid gap-4">
                    {upcoming.map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="selected" className="space-y-4">
                {pickedTasks.length === 0 ? (
                  <EmptyState
                    title="Tanggal ini kosong"
                    description="Pilih tanggal lain atau tambahkan task dengan due date."
                  />
                ) : (
                  <div className="grid gap-4">
                    {pickedTasks.map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
