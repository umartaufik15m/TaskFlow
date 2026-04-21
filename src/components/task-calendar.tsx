"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { formatDateLabel, toDateKey, toLocalDateKey } from "@/lib/taskflow";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

export default function TaskCalendar({ tasks, selectedDate }: TaskCalendarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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

  const todayKey = toDateKey(new Date());
  const activeDateKey = selectedDate || todayKey;
  const activeDateTasks = dateMap.get(activeDateKey) || [];

  function updateSelectedDate(nextDate?: Date) {
    const params = new URLSearchParams(searchParams.toString());

    if (!nextDate) {
      params.delete("date");
    } else {
      params.set("date", toDateKey(nextDate));
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--muted)]">Planner view</p>
          <CardTitle className="mt-2 text-xl">Pilih tanggal</CardTitle>
        </div>
        {selectedDate ? (
          <Button variant="secondary" size="sm" onClick={() => updateSelectedDate(undefined)}>
            Reset tanggal
          </Button>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-6">
        <Calendar
          mode="single"
          selected={new Date(activeDateKey)}
          onSelect={updateSelectedDate}
          modifiers={{
            hasTask: tasks.filter((task) => Boolean(task.due_date)).map((task) => new Date(task.due_date as string)),
          }}
          modifiersClassNames={{
            hasTask: "border border-[color:var(--accent-strong)]",
          }}
        />

        <div className="rounded-2xl border border-[color:var(--card-border)] bg-[color:var(--card-strong)] p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--muted)]">Tanggal aktif</p>
          <h3 className="mt-2 text-lg font-semibold">{formatDateLabel(activeDateKey)}</h3>

          {activeDateTasks.length === 0 ? (
            <p className="mt-3 text-sm text-[color:var(--muted)]">Belum ada task pada tanggal ini.</p>
          ) : (
            <div className="mt-4 space-y-2">
              {activeDateTasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-xl border border-[color:var(--card-border)] px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-[color:var(--muted)]">
                      {task.is_completed ? "Done" : task.status}
                    </p>
                  </div>
                  <Badge variant={task.priority === "high" ? "destructive" : task.priority === "medium" ? "outline" : "secondary"}>
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
