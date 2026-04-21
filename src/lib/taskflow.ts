import type { User } from "@supabase/supabase-js";

export const THEME_OPTIONS = ["ember", "rose", "light"] as const;

export type AppTheme = (typeof THEME_OPTIONS)[number];
export type TaskStatus = "todo" | "progress" | "done";
export type TaskPriority = "low" | "medium" | "high";
export type TaskKind = "task" | "daily" | "project" | "event" | "reminder";

export type TaskRecord = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  task_type: TaskKind;
  due_date: string | null;
  reminder_days: number | null;
  is_completed: boolean;
  created_at: string;
  updated_at?: string | null;
};

export type TaskFilters = {
  q?: string;
  status?: string;
  priority?: string;
  type?: string;
  date?: string;
};

export const TASK_STATUS_OPTIONS: TaskStatus[] = ["todo", "progress", "done"];
export const TASK_PRIORITY_OPTIONS: TaskPriority[] = ["low", "medium", "high"];
export const TASK_KIND_OPTIONS: TaskKind[] = [
  "task",
  "daily",
  "project",
  "event",
  "reminder",
];

export const DEFAULT_THEME: AppTheme = "ember";

export function isTheme(value: string | undefined): value is AppTheme {
  return THEME_OPTIONS.includes((value ?? "") as AppTheme);
}

export function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function toDateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function getDisplayName(user: User) {
  const username = String(user.user_metadata?.username ?? "").trim();

  if (username) {
    return username;
  }

  const email = user.email ?? "taskflow";
  return email.split("@")[0];
}

export function getMonogram(value: string) {
  const letters = value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return letters || "TF";
}

export function toLocalDateKey(value: string) {
  return toDateKey(new Date(value));
}

export function formatDateLabel(value: string | null) {
  if (!value) {
    return "Belum ada tanggal";
  }

  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDateTimeLabel(value: string | null) {
  if (!value) {
    return "Belum ada tanggal";
  }

  return new Date(value).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function toDateTimeInputValue(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

export function normalizeDueDate(raw: string) {
  const value = raw.trim();

  if (!value) {
    return null;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
}

export function getDueState(task: TaskRecord, now = new Date()) {
  if (!task.due_date || task.is_completed || task.status === "done") {
    return null;
  }

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const due = new Date(task.due_date);
  due.setHours(0, 0, 0, 0);

  const diff = Math.ceil((due.getTime() - today.getTime()) / 86400000);

  if (diff < 0) {
    return {
      label: `Lewat ${Math.abs(diff)} hari`,
      tone: "danger" as const,
      order: 0,
    };
  }

  if (diff === 0) {
    return {
      label: "Jatuh hari ini",
      tone: "danger" as const,
      order: 1,
    };
  }

  if (diff === 1) {
    return {
      label: "Besok",
      tone: "warning" as const,
      order: 2,
    };
  }

  if (diff <= 3) {
    return {
      label: `${diff} hari lagi`,
      tone: "warning" as const,
      order: 3,
    };
  }

  return {
    label: `${diff} hari lagi`,
    tone: "muted" as const,
    order: 4,
  };
}

export function filterTasks(tasks: TaskRecord[], filters: TaskFilters) {
  const searchQuery = (filters.q ?? "").trim().toLowerCase();
  const statusFilter = (filters.status ?? "all").trim();
  const priorityFilter = (filters.priority ?? "all").trim();
  const typeFilter = (filters.type ?? "all").trim();
  const selectedDate = (filters.date ?? "").trim();

  return tasks.filter((task) => {
    const matchesSearch =
      !searchQuery ||
      task.title.toLowerCase().includes(searchQuery) ||
      (task.description ?? "").toLowerCase().includes(searchQuery);

    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || task.priority === priorityFilter;
    const matchesType = typeFilter === "all" || task.task_type === typeFilter;
    const matchesDate =
      !selectedDate ||
      (task.due_date ? toLocalDateKey(task.due_date) === selectedDate : false);

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority &&
      matchesType &&
      matchesDate
    );
  });
}

export function sortTasksForFocus(tasks: TaskRecord[]) {
  const priorityScore = {
    high: 3,
    medium: 2,
    low: 1,
  } satisfies Record<TaskPriority, number>;

  return [...tasks].sort((left, right) => {
    const dueLeft = left.due_date ? new Date(left.due_date).getTime() : Number.MAX_SAFE_INTEGER;
    const dueRight = right.due_date
      ? new Date(right.due_date).getTime()
      : Number.MAX_SAFE_INTEGER;

    if (priorityScore[left.priority] !== priorityScore[right.priority]) {
      return priorityScore[right.priority] - priorityScore[left.priority];
    }

    if (dueLeft !== dueRight) {
      return dueLeft - dueRight;
    }

    return new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
  });
}

export function getTaskCounts(tasks: TaskRecord[]) {
  const todayKey = toDateKey(new Date());

  const active = tasks.filter((task) => !task.is_completed && task.status !== "done");
  const completed = tasks.filter((task) => task.is_completed || task.status === "done");
  const progress = tasks.filter((task) => task.status === "progress");
  const dueToday = active.filter(
    (task) => task.due_date && toLocalDateKey(task.due_date) === todayKey
  );
  const withDeadline = tasks.filter((task) => Boolean(task.due_date));

  return {
    active,
    completed,
    progress,
    dueToday,
    withDeadline,
  };
}

export function getThemeLabel(theme: AppTheme) {
  if (theme === "ember") return "Spiderman";
  if (theme === "rose") return "Mary Jane";
  return "Soft Light";
}

export function getStatusLabel(status: TaskStatus) {
  if (status === "progress") return "In progress";
  if (status === "done") return "Done";
  return "To do";
}

export function getTaskKindLabel(kind: TaskKind) {
  if (kind === "daily") return "Daily";
  if (kind === "project") return "Project";
  if (kind === "event") return "Event";
  if (kind === "reminder") return "Reminder";
  return "Task";
}
