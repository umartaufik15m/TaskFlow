"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { formatDateLabel, toDateKey, toLocalDateKey } from "@/lib/taskflow";

type CalendarTask = {
  id: string;
  title: string;
  due_date: string | null;
  priority: "low" | "medium" | "high";
  status: string;
  is_completed: boolean;
};

type TaskCalendarProps = {
  tasks: CalendarTask[];
  selectedDate?: string;
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

function priorityOrder(priority: "low" | "medium" | "high") {
  if (priority === "high") return 3;
  if (priority === "medium") return 2;
  return 1;
}

export default function TaskCalendar({ tasks, selectedDate }: TaskCalendarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialAnchor = useMemo(() => {
    if (selectedDate) {
      const picked = new Date(selectedDate);
      if (!Number.isNaN(picked.getTime())) {
        return new Date(picked.getFullYear(), picked.getMonth(), 1);
      }
    }

    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }, [selectedDate]);

  const [monthAnchor, setMonthAnchor] = useState(initialAnchor);
  const todayKey = toDateKey(new Date());

  const dateMap = useMemo(() => {
    const map = new Map<string, CalendarTask[]>();

    for (const task of tasks) {
      if (!task.due_date) continue;
      const key = toLocalDateKey(task.due_date);
      const current = map.get(key) || [];
      current.push(task);
      map.set(key, current);
    }

    return map;
  }, [tasks]);

  const currentYear = monthAnchor.getFullYear();
  const currentMonth = monthAnchor.getMonth();
  const monthStart = new Date(currentYear, currentMonth, 1);
  const monthEnd = new Date(currentYear, currentMonth + 1, 0);
  const firstDayIndex = monthStart.getDay();
  const totalDays = monthEnd.getDate();

  const activeDateKey = selectedDate || todayKey;
  const activeDateTasks = dateMap.get(activeDateKey) || [];

  function updateSelectedDate(dateKey: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (selectedDate === dateKey) {
      params.delete("date");
    } else {
      params.set("date", dateKey);
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function clearSelectedDate() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("date");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="section-card surface-strong">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="hero-label">Planner view</p>
          <h2 className="mt-3 text-2xl font-black">
            {MONTHS[currentMonth]} {currentYear}
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMonthAnchor(new Date(currentYear, currentMonth - 1, 1))}
            className="btn-secondary"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => setMonthAnchor(new Date(currentYear, currentMonth + 1, 1))}
            className="btn-secondary"
          >
            Next
          </button>
          {selectedDate ? (
            <button type="button" onClick={clearSelectedDate} className="btn-secondary">
              Reset tanggal
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-2 text-center text-sm text-[color:var(--muted)]">
        {DAYS.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-7 gap-2">
        {Array.from({ length: firstDayIndex }).map((_, index) => (
          <div
            key={`empty-${index}`}
            className="aspect-square rounded-[18px] border border-transparent"
          />
        ))}

        {Array.from({ length: totalDays }).map((_, index) => {
          const day = index + 1;
          const date = new Date(currentYear, currentMonth, day);
          const dateKey = toDateKey(date);
          const dayTasks = dateMap.get(dateKey) || [];
          const dayPriorities = [...new Set(dayTasks.map((task) => task.priority))]
            .sort((a, b) => priorityOrder(b) - priorityOrder(a))
            .slice(0, 3);
          const isToday = todayKey === dateKey;
          const isSelected = selectedDate === dateKey;

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => updateSelectedDate(dateKey)}
              className={`aspect-square rounded-[18px] border p-2 text-left transition ${
                isSelected
                  ? "border-[color:var(--accent-strong)] bg-[color:var(--accent-soft)]"
                  : isToday
                  ? "border-[color:var(--card-border)] bg-white/8"
                  : "border-[color:var(--card-border)] bg-white/[0.03]"
              }`}
            >
              <span className="block text-sm font-semibold">{day}</span>
              <div className="mt-2 flex gap-1">
                {dayPriorities.map((priority) => (
                  <span
                    key={`${dateKey}-${priority}`}
                    className={`h-1.5 w-6 rounded-full ${
                      priority === "high"
                        ? "bg-[color:var(--danger)]"
                        : priority === "medium"
                        ? "bg-[color:var(--warning)]"
                        : "bg-[color:var(--success)]"
                    }`}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-8 section-card surface">
        <p className="hero-label">
          {selectedDate ? "Tanggal aktif" : "Task hari ini"}
        </p>
        <h3 className="mt-3 text-xl font-black">
          {selectedDate ? formatDateLabel(selectedDate) : formatDateLabel(todayKey)}
        </h3>

        {activeDateTasks.length === 0 ? (
          <p className="section-copy mt-3">Belum ada task pada tanggal ini.</p>
        ) : (
          <div className="task-grid mt-5">
            {activeDateTasks.slice(0, 4).map((task) => (
              <div key={task.id} className="rounded-[22px] border border-[color:var(--card-border)] bg-white/[0.04] px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <strong className="block text-sm">{task.title}</strong>
                    <span className="mt-1 block text-xs text-[color:var(--muted)]">
                      {task.is_completed ? "Done" : task.status}
                    </span>
                  </div>
                  <span
                    className={`badge ${
                      task.priority === "high"
                        ? "is-high"
                        : task.priority === "medium"
                        ? "is-medium"
                        : "is-low"
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
