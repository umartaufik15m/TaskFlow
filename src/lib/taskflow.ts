import type { User } from "@supabase/supabase-js";

export const THEME_OPTIONS = ["ember", "light"] as const;
export const TASK_STATUS_OPTIONS = ["todo", "progress", "done"] as const;
export const TASK_PRIORITY_OPTIONS = ["low", "medium", "high"] as const;
export const ACTIVITY_SCOPE_OPTIONS = ["work", "personal"] as const;
export const CATEGORY_DOMAIN_OPTIONS = ["work", "personal"] as const;

export type AppTheme = (typeof THEME_OPTIONS)[number];
export type TaskStatus = (typeof TASK_STATUS_OPTIONS)[number];
export type TaskPriority = (typeof TASK_PRIORITY_OPTIONS)[number];
export type ActivityScope = (typeof ACTIVITY_SCOPE_OPTIONS)[number];
export type CategoryDomain = (typeof CATEGORY_DOMAIN_OPTIONS)[number];

export type CompanyRecord = {
  id: string;
  user_id: string | null;
  name: string;
  created_at?: string | null;
  updated_at?: string | null;
};

export type CategoryRecord = {
  id: string;
  user_id: string | null;
  name: string;
  domain: CategoryDomain;
  created_at?: string | null;
  updated_at?: string | null;
};

export type TaskRecord = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  scope: ActivityScope;
  company_id: string | null;
  category_id: string | null;
  scheduled_for: string | null;
  has_deadline: boolean;
  deadline_at: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at?: string | null;
  company_name?: string | null;
  category_name?: string | null;
  task_type?: string | null;
  due_date?: string | null;
  reminder_days?: number | null;
};

export type ViewerData = {
  user: User;
  displayName: string;
  companies: CompanyRecord[];
  categories: CategoryRecord[];
  tasks: TaskRecord[];
};

export type TaskFilters = {
  q?: string;
  status?: string;
  priority?: string;
  scope?: string;
  companyId?: string;
  categoryId?: string;
  date?: string;
};

export type MonthlyCompletion = {
  monthKey: string;
  label: string;
  total: number;
  completed: number;
};

export type CompanyDistribution = {
  companyId: string;
  name: string;
  total: number;
  completed: number;
};

export type DailyCategorySummary = {
  dateKey: string;
  label: string;
  items: Array<{
    categoryId: string;
    categoryName: string;
    total: number;
    completed: number;
  }>;
};

export const DEFAULT_THEME: AppTheme = "ember";
export const DEFAULT_COMPANY_ID = "company-personal";

export const DEFAULT_COMPANIES: CompanyRecord[] = [
  {
    id: DEFAULT_COMPANY_ID,
    user_id: null,
    name: "Pribadi",
  },
];

export const DEFAULT_CATEGORIES: CategoryRecord[] = [
  { id: "category-work-task", user_id: null, name: "Task", domain: "work" },
  { id: "category-work-project", user_id: null, name: "Project", domain: "work" },
  { id: "category-work-event", user_id: null, name: "Event", domain: "work" },
  { id: "category-personal-task", user_id: null, name: "Tugas", domain: "personal" },
  { id: "category-personal-hobby", user_id: null, name: "Hobi", domain: "personal" },
  { id: "category-personal-event", user_id: null, name: "Event", domain: "personal" },
];

export function isTheme(value: string | undefined): value is AppTheme {
  return THEME_OPTIONS.includes((value ?? "") as AppTheme);
}

export function pad(value: number) {
  return String(value).padStart(2, "0");
}

function parseDateParts(value: string) {
  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  const match = normalized.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2})(?::(\d{2}))?)?$/
  );

  if (!match) {
    return null;
  }

  const [, yearRaw, monthRaw, dayRaw, hourRaw = "00", minuteRaw = "00", secondRaw = "00"] =
    match;
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);
  const hour = Number(hourRaw);
  const minute = Number(minuteRaw);
  const second = Number(secondRaw);

  if (
    !Number.isInteger(year) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59 ||
    second < 0 ||
    second > 59
  ) {
    return null;
  }

  return { year, month, day, hour, minute, second };
}

export function parseTaskDate(value: string | null) {
  if (!value) {
    return null;
  }

  const parts = parseDateParts(value);

  if (parts) {
    return parts;
  }

  const fallback = new Date(value);

  if (Number.isNaN(fallback.getTime())) {
    return null;
  }

  return {
    year: fallback.getFullYear(),
    month: fallback.getMonth() + 1,
    day: fallback.getDate(),
    hour: fallback.getHours(),
    minute: fallback.getMinutes(),
    second: fallback.getSeconds(),
  };
}

export function normalizeDateTimeInput(raw: string) {
  const parsed = parseDateParts(raw);

  if (!parsed) {
    return null;
  }

  return `${parsed.year}-${pad(parsed.month)}-${pad(parsed.day)}T${pad(parsed.hour)}:${pad(
    parsed.minute
  )}:${pad(parsed.second)}`;
}

export function toDateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function toLocalDateKey(value: string) {
  const parsed = parseTaskDate(value);

  if (!parsed) {
    return "";
  }

  return `${parsed.year}-${pad(parsed.month)}-${pad(parsed.day)}`;
}

export function toDateTimeInputValue(value: string | null) {
  const parsed = parseTaskDate(value);

  if (!parsed) {
    return "";
  }

  return `${parsed.year}-${pad(parsed.month)}-${pad(parsed.day)}T${pad(parsed.hour)}:${pad(
    parsed.minute
  )}`;
}

export function formatDateLabel(value: string | null) {
  if (!value) {
    return "Belum ada tanggal";
  }

  const parsed = parseTaskDate(value);

  if (!parsed) {
    return "Belum ada tanggal";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(parsed.year, parsed.month - 1, parsed.day));
}

export function formatDateTimeLabel(value: string | null) {
  if (!value) {
    return "Belum ada jadwal";
  }

  const parsed = parseTaskDate(value);

  if (!parsed) {
    return "Belum ada jadwal";
  }

  const dateLabel = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(parsed.year, parsed.month - 1, parsed.day));

  return `${dateLabel}, ${pad(parsed.hour)}:${pad(parsed.minute)}`;
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

export function getThemeLabel(theme: AppTheme) {
  if (theme === "ember") return "Ember";
  return "Lotus";
}

export function getStatusLabel(status: TaskStatus) {
  if (status === "progress") return "In Progress";
  if (status === "done") return "Selesai";
  return "To Do";
}

export function getScopeLabel(scope: ActivityScope) {
  return scope === "work" ? "Kerja" : "Pribadi";
}

export function getScheduleValue(task: TaskRecord) {
  return task.scheduled_for ?? task.deadline_at ?? task.due_date ?? null;
}

export function getDeadlineValue(task: TaskRecord) {
  if (task.has_deadline && task.deadline_at) {
    return task.deadline_at;
  }

  return task.scope === "work" ? task.due_date ?? null : null;
}

export function getTaskDateKey(task: TaskRecord) {
  const value = getScheduleValue(task);
  return value ? toLocalDateKey(value) : "";
}

export function getMonthKeyFromValue(value: string | null) {
  const parsed = value ? parseTaskDate(value) : null;

  if (!parsed) {
    return "";
  }

  return `${parsed.year}-${pad(parsed.month)}`;
}

export function getTaskMonthKey(task: TaskRecord) {
  return getMonthKeyFromValue(getScheduleValue(task));
}

export function getCompanyName(task: TaskRecord, companies: CompanyRecord[]) {
  if (task.company_name) {
    return task.company_name;
  }

  const company = companies.find((item) => item.id === task.company_id);
  return company?.name ?? (task.scope === "personal" ? "Pribadi" : "Tanpa perusahaan");
}

export function getCategoryName(task: TaskRecord, categories: CategoryRecord[]) {
  if (task.category_name) {
    return task.category_name;
  }

  const category = categories.find((item) => item.id === task.category_id);

  if (category) {
    return category.name;
  }

  if (task.scope === "work") {
    return "Task";
  }

  return "Tugas";
}

export function getDueState(task: TaskRecord, now = new Date()) {
  const deadline = getDeadlineValue(task);

  if (!deadline || task.is_completed || task.status === "done") {
    return null;
  }

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const dueKey = toLocalDateKey(deadline);

  if (!dueKey) {
    return null;
  }

  const [year, month, day] = dueKey.split("-").map(Number);
  const due = new Date(year, month - 1, day);
  due.setHours(0, 0, 0, 0);

  const diff = Math.ceil((due.getTime() - today.getTime()) / 86400000);

  if (diff < 0) {
    return { label: `Lewat ${Math.abs(diff)} hari`, tone: "danger" as const };
  }

  if (diff === 0) {
    return { label: "Deadline hari ini", tone: "danger" as const };
  }

  if (diff === 1) {
    return { label: "Deadline besok", tone: "warning" as const };
  }

  return { label: `${diff} hari lagi`, tone: "muted" as const };
}

export function filterTasks(tasks: TaskRecord[], filters: TaskFilters) {
  const searchQuery = (filters.q ?? "").trim().toLowerCase();
  const statusFilter = (filters.status ?? "all").trim();
  const priorityFilter = (filters.priority ?? "all").trim();
  const scopeFilter = (filters.scope ?? "all").trim();
  const companyFilter = (filters.companyId ?? "all").trim();
  const categoryFilter = (filters.categoryId ?? "all").trim();
  const selectedDate = (filters.date ?? "").trim();

  return tasks.filter((task) => {
    const matchesSearch =
      !searchQuery ||
      task.title.toLowerCase().includes(searchQuery) ||
      (task.description ?? "").toLowerCase().includes(searchQuery);

    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    const matchesScope = scopeFilter === "all" || task.scope === scopeFilter;
    const matchesCompany = companyFilter === "all" || task.company_id === companyFilter;
    const matchesCategory = categoryFilter === "all" || task.category_id === categoryFilter;
    const matchesDate = !selectedDate || getTaskDateKey(task) === selectedDate;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority &&
      matchesScope &&
      matchesCompany &&
      matchesCategory &&
      matchesDate
    );
  });
}

export function sortTasksForFocus(tasks: TaskRecord[]) {
  const priorityScore = { high: 3, medium: 2, low: 1 } satisfies Record<TaskPriority, number>;

  return [...tasks].sort((left, right) => {
    const leftAnchor = getDeadlineValue(left) ?? getScheduleValue(left);
    const rightAnchor = getDeadlineValue(right) ?? getScheduleValue(right);
    const leftTime = leftAnchor ? new Date(leftAnchor).getTime() : Number.MAX_SAFE_INTEGER;
    const rightTime = rightAnchor ? new Date(rightAnchor).getTime() : Number.MAX_SAFE_INTEGER;

    if (priorityScore[left.priority] !== priorityScore[right.priority]) {
      return priorityScore[right.priority] - priorityScore[left.priority];
    }

    if (leftTime !== rightTime) {
      return leftTime - rightTime;
    }

    return new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
  });
}

export function getTaskCounts(tasks: TaskRecord[]) {
  const todayKey = toDateKey(new Date());
  const active = tasks.filter((task) => !task.is_completed && task.status !== "done");
  const completed = tasks.filter((task) => task.is_completed || task.status === "done");
  const progress = tasks.filter((task) => task.status === "progress");
  const dueToday = active.filter((task) => {
    const deadline = getDeadlineValue(task);
    return deadline ? toLocalDateKey(deadline) === todayKey : false;
  });

  return {
    active,
    completed,
    progress,
    dueToday,
  };
}

export function getAvailableMonthKeys(tasks: TaskRecord[]) {
  const keys = new Set<string>();

  for (const task of tasks) {
    const key = getTaskMonthKey(task);
    if (key) {
      keys.add(key);
    }
  }

  const current = toDateKey(new Date()).slice(0, 7);
  keys.add(current);

  return [...keys].sort();
}

export function formatMonthKey(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
}

export function getMonthlyCompletion(tasks: TaskRecord[]): MonthlyCompletion[] {
  return getAvailableMonthKeys(tasks).map((monthKey) => {
    const items = tasks.filter((task) => getTaskMonthKey(task) === monthKey);
    const completed = items.filter((task) => task.is_completed || task.status === "done").length;

    return {
      monthKey,
      label: formatMonthKey(monthKey),
      total: items.length,
      completed,
    };
  });
}

export function getCompanyDistribution(
  tasks: TaskRecord[],
  companies: CompanyRecord[]
): CompanyDistribution[] {
  const map = new Map<string, CompanyDistribution>();

  for (const task of tasks) {
    const companyId = task.company_id ?? DEFAULT_COMPANY_ID;
    const name = getCompanyName(task, companies);
    const current = map.get(companyId) ?? {
      companyId,
      name,
      total: 0,
      completed: 0,
    };

    current.total += 1;
    if (task.is_completed || task.status === "done") {
      current.completed += 1;
    }
    map.set(companyId, current);
  }

  return [...map.values()].sort((left, right) => right.total - left.total);
}

export function getDailyCategorySummaries(
  tasks: TaskRecord[],
  categories: CategoryRecord[],
  days = 7
): DailyCategorySummary[] {
  const result: DailyCategorySummary[] = [];

  for (let offset = 0; offset < days; offset += 1) {
    const date = new Date();
    date.setDate(date.getDate() - offset);
    const dateKey = toDateKey(date);
    const items = tasks.filter((task) => getTaskDateKey(task) === dateKey);
    const categoryMap = new Map<string, DailyCategorySummary["items"][number]>();

    for (const task of items) {
      const categoryId = task.category_id ?? "uncategorized";
      const categoryName = getCategoryName(task, categories);
      const current = categoryMap.get(categoryId) ?? {
        categoryId,
        categoryName,
        total: 0,
        completed: 0,
      };

      current.total += 1;
      if (task.is_completed || task.status === "done") {
        current.completed += 1;
      }

      categoryMap.set(categoryId, current);
    }

    result.push({
      dateKey,
      label: new Intl.DateTimeFormat("id-ID", {
        weekday: "short",
        day: "numeric",
        month: "short",
      }).format(date),
      items: [...categoryMap.values()].sort((left, right) => right.total - left.total),
    });
  }

  return result;
}

export function getCalendarDensity(tasks: TaskRecord[]) {
  const density = new Map<string, number>();

  for (const task of tasks) {
    const key = getTaskDateKey(task);

    if (!key) {
      continue;
    }

    density.set(key, (density.get(key) ?? 0) + 1);
  }

  return density;
}
