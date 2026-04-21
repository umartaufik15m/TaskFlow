"use client";

import { useMemo, useState } from "react";
import {
  formatDateLabel,
  getCalendarDensity,
  getDeadlineValue,
  getTaskDateKey,
  toDateKey,
  toLocalDateKey,
  type TaskRecord,
} from "@/lib/taskflow";

type TaskCalendarProps = {
  tasks: TaskRecord[];
  initialMonthKey?: string;
  mode?: "dashboard" | "planner";
};

const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function createMonthDate(monthKey?: string) {
  if (monthKey) {
    const [year, month] = monthKey.split("-").map(Number);
    if (year && month) {
      return new Date(year, month - 1, 1);
    }
  }

  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export default function TaskCalendar({
  tasks,
  initialMonthKey,
  mode = "planner",
}: TaskCalendarProps) {
  const [monthAnchor, setMonthAnchor] = useState(createMonthDate(initialMonthKey));
  const [selectedDate, setSelectedDate] = useState<string>(toDateKey(new Date()));
  const todayKey = toDateKey(new Date());
  const densityMap = useMemo(() => getCalendarDensity(tasks), [tasks]);
  const deadlineMap = useMemo(() => {
    const map = new Map<string, number>();

    for (const task of tasks) {
      if (task.is_completed || task.status === "done") {
        continue;
      }

      const deadline = getDeadlineValue(task);
      const deadlineKey = deadline ? toLocalDateKey(deadline) : "";

      if (!deadlineKey) {
        continue;
      }

      map.set(deadlineKey, (map.get(deadlineKey) ?? 0) + 1);
    }

    return map;
  }, [tasks]);

  const currentYear = monthAnchor.getFullYear();
  const currentMonth = monthAnchor.getMonth();
  const monthStart = new Date(currentYear, currentMonth, 1);
  const monthEnd = new Date(currentYear, currentMonth + 1, 0);
  const firstDayIndex = monthStart.getDay();
  const totalDays = monthEnd.getDate();
  const activeDateTasks = tasks.filter((task) => getTaskDateKey(task) === selectedDate).slice(0, 5);
  const maxDensity = Math.max(...densityMap.values(), 1);

  function moveMonth(offset: number) {
    const nextDate = new Date(currentYear, currentMonth + offset, 1);
    setMonthAnchor(nextDate);
    setSelectedDate(toDateKey(nextDate));
  }

  return (
    <div className="section-card surface-strong calendar-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="hero-label">{mode === "dashboard" ? "Kalender kerja" : "Kalender planner"}</p>
          <h2 className="mt-3 text-2xl font-black">
            {MONTHS[currentMonth]} {currentYear}
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => moveMonth(-1)}
            className="btn-secondary"
          >
            Sebelumnya
          </button>
          <button
            type="button"
            onClick={() => moveMonth(1)}
            className="btn-secondary"
          >
            Berikutnya
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-2 text-center text-sm text-[color:var(--muted)]">
        {DAYS.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-7 gap-2">
        {Array.from({ length: firstDayIndex }).map((_, index) => (
          <div key={`empty-${index}`} className="calendar-cell is-empty" />
        ))}

        {Array.from({ length: totalDays }).map((_, index) => {
          const day = index + 1;
          const date = new Date(currentYear, currentMonth, day);
          const dateKey = toDateKey(date);
          const density = densityMap.get(dateKey) ?? 0;
          const deadlines = deadlineMap.get(dateKey) ?? 0;
          const intensity = density === 0 ? 0 : Math.max(0.18, density / maxDensity);
          const isToday = todayKey === dateKey;
          const isSelected = selectedDate === dateKey;

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => setSelectedDate(dateKey)}
              className={`calendar-cell ${isSelected ? "is-selected" : ""} ${isToday ? "is-today" : ""} ${deadlines > 0 ? "has-deadline" : ""}`}
              style={{
                backgroundColor:
                  density === 0
                    ? undefined
                    : `color-mix(in srgb, var(--accent-strong) ${Math.round(intensity * 100)}%, transparent)`,
              }}
            >
              <span className="calendar-cell-day">{day}</span>
              <span className="calendar-cell-density">
                {deadlines > 0 ? `${deadlines} deadline` : density > 0 ? `${density} jadwal` : ""}
              </span>
            </button>
          );
        })}
      </div>

      <div className="calendar-density-legend">
        <span>
          <i style={{ background: "rgba(255, 255, 255, 0.05)" }} />
          Longgar
        </span>
        <span>
          <i style={{ background: "color-mix(in srgb, var(--accent-strong) 38%, transparent)" }} />
          Sedang
        </span>
        <span>
          <i style={{ background: "color-mix(in srgb, var(--accent-strong) 78%, transparent)" }} />
          Padat
        </span>
        <span>
          <i className="calendar-deadline-dot" />
          Ada deadline
        </span>
      </div>

      <div className="mt-8 section-card surface">
        <p className="hero-label">{mode === "dashboard" ? "Aktivitas terpilih" : "Jadwal terpilih"}</p>
        <h3 className="mt-3 text-xl font-black">{formatDateLabel(selectedDate)}</h3>

        {activeDateTasks.length === 0 ? (
          <p className="section-copy mt-3">Belum ada aktivitas pada tanggal ini.</p>
        ) : (
          <div className="task-grid mt-5">
            {activeDateTasks.map((task) => (
              <div key={task.id} className="calendar-task-item">
                <strong>{task.title}</strong>
                <span>{task.category_name ?? "Tanpa kategori"}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
