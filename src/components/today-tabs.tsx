"use client";

import TaskCard from "@/components/TaskCard";
import EmptyState from "@/components/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TaskRecord } from "@/lib/taskflow";

type TodayTabsProps = {
  priorityToday: TaskRecord[];
  todayDeadline: TaskRecord[];
  otherTasks: TaskRecord[];
};

function TaskSection({
  tasks,
  emptyTitle,
  emptyDescription,
}: {
  tasks: TaskRecord[];
  emptyTitle: string;
  emptyDescription: string;
}) {
  if (tasks.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}

export default function TodayTabs({ priorityToday, todayDeadline, otherTasks }: TodayTabsProps) {
  return (
    <Tabs defaultValue="priority" className="space-y-4">
      <TabsList>
        <TabsTrigger value="priority">Prioritas</TabsTrigger>
        <TabsTrigger value="deadline">Deadline Hari Ini</TabsTrigger>
        <TabsTrigger value="others">Lainnya</TabsTrigger>
      </TabsList>

      <TabsContent value="priority">
        <TaskSection
          tasks={priorityToday}
          emptyTitle="Tidak ada prioritas tinggi"
          emptyDescription="Hari ini masih longgar. Kamu bisa ambil task aktif biasa."
        />
      </TabsContent>

      <TabsContent value="deadline">
        <TaskSection
          tasks={todayDeadline}
          emptyTitle="Aman untuk hari ini"
          emptyDescription="Belum ada task yang jatuh tempo hari ini."
        />
      </TabsContent>

      <TabsContent value="others">
        <TaskSection
          tasks={otherTasks}
          emptyTitle="Semua sudah rapi"
          emptyDescription="Task aktifmu habis atau sudah masuk prioritas utama."
        />
      </TabsContent>
    </Tabs>
  );
}
