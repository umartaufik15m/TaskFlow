import type { Metadata } from "next";
import AppShell from "@/components/app-shell";
import DeepWorkModal from "@/components/deep-work-modal";
import TasksWorkspace from "@/components/tasks-workspace";
import { getViewerData } from "@/lib/taskflow-server";

export const metadata: Metadata = { title: "Tasks" };

export default async function TasksPage() {
  const { user, displayName, tasks, companies, categories } = await getViewerData();
  return <AppShell user={user} displayName={displayName} pageKey="tasks" pageLabel="Capture → plan → do" pageTitle="Tasks" pageDescription="Satu tempat untuk semua yang mau lo kerjain. List dan kalender, tanpa board yang tumpang tindih." heroMode="compact" actions={<DeepWorkModal tasks={tasks.map((task) => ({ id: task.id, title: task.title, status: task.status, is_completed: task.is_completed }))} />}><TasksWorkspace tasks={tasks} companies={companies} categories={categories} /></AppShell>;
}
