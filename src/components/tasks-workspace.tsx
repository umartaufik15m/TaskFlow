"use client";

import { useMemo, useState } from "react";
import PlannerForm from "@/components/planner-form";
import TaskCalendar from "@/components/task-calendar";
import TaskCard from "@/components/TaskCard";
import type { CategoryRecord, CompanyRecord, TaskRecord } from "@/lib/taskflow";

export default function TasksWorkspace({
  tasks,
  companies,
  categories,
}: {
  tasks: TaskRecord[];
  companies: CompanyRecord[];
  categories: CategoryRecord[];
}) {
  const [view, setView] = useState<"list" | "calendar">("list");
  const [filter, setFilter] = useState<"active" | "all" | "done">("active");

  const visibleTasks = useMemo(() => {
    if (filter === "done") return tasks.filter((task) => task.status === "done" || task.is_completed);
    if (filter === "active") return tasks.filter((task) => task.status !== "done" && !task.is_completed);
    return tasks;
  }, [filter, tasks]);

  return (
    <div className="tasks-stack">
      <section id="new-task" className="anchor-section">
        <PlannerForm companies={companies} categories={categories} />
      </section>

      <section className="section-card surface-strong">
        <div className="tasks-toolbar">
          <div>
            <p className="hero-label">Satu sumber kebenaran</p>
            <h2 className="section-title">Semua yang perlu dikerjain</h2>
          </div>
          <div className="segmented-control" aria-label="Tampilan tugas">
            <button type="button" className={view === "list" ? "is-active" : ""} onClick={() => setView("list")}>List</button>
            <button type="button" className={view === "calendar" ? "is-active" : ""} onClick={() => setView("calendar")}>Calendar</button>
          </div>
        </div>

        <div className="filter-row">
          {(["active", "all", "done"] as const).map((value) => (
            <button key={value} type="button" className={filter === value ? "is-active" : ""} onClick={() => setFilter(value)}>
              {value === "active" ? "Aktif" : value === "done" ? "Selesai" : "Semua"}
            </button>
          ))}
          <span>{visibleTasks.length} task</span>
        </div>

        {view === "list" ? (
          visibleTasks.length ? (
            <div className="task-grid two-col mt-6">
              {visibleTasks.map((task) => (
                <TaskCard key={task.id} task={task} companies={companies} categories={categories} compact showStartButton />
              ))}
            </div>
          ) : (
            <div className="empty-card surface mt-6"><strong>Belum ada task di sini.</strong><p>Tambah satu hal kecil yang mau lo beresin.</p></div>
          )
        ) : (
          <div className="mt-6"><TaskCalendar tasks={visibleTasks} mode="planner" /></div>
        )}
      </section>
    </div>
  );
}
