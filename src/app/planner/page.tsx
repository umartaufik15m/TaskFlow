import AppShell from "@/components/app-shell";
import PlannerForm from "@/components/planner-form";
import TaskCalendar from "@/components/task-calendar";
import { getViewerData } from "@/lib/taskflow-server";

export default async function PlannerPage() {
  const { user, displayName, tasks, companies, categories } = await getViewerData();

  return (
    <AppShell
      user={user}
      displayName={displayName}
      pageKey="planner"
      pageLabel="Planner"
      pageTitle="Planner"
      heroMode="compact"
    >
      <section className="section-grid two-col planner-layout">
        <PlannerForm companies={companies} categories={categories} />
        <TaskCalendar tasks={tasks} mode="planner" />
      </section>
    </AppShell>
  );
}
