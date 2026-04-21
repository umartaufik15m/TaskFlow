import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_CATEGORIES,
  DEFAULT_COMPANIES,
  DEFAULT_COMPANY_ID,
  getDisplayName,
  type CategoryRecord,
  type CompanyRecord,
  type TaskRecord,
  type ViewerData,
} from "@/lib/taskflow";

function normalizeTaskRecord(
  raw: Record<string, unknown>,
  companies: CompanyRecord[],
  categories: CategoryRecord[]
): TaskRecord {
  const scope = raw.scope === "work" ? "work" : "personal";
  const companyId = String(raw.company_id ?? "").trim() || DEFAULT_COMPANY_ID;
  const categoryId = String(raw.category_id ?? "").trim() || null;
  const category = categories.find((item) => item.id === categoryId) ?? null;
  const company = companies.find((item) => item.id === companyId) ?? null;
  const scheduledFor = String(raw.scheduled_for ?? "").trim() || String(raw.due_date ?? "").trim() || null;
  const deadlineAt = String(raw.deadline_at ?? "").trim() || String(raw.due_date ?? "").trim() || null;
  const hasDeadline = Boolean(raw.has_deadline) || Boolean(deadlineAt);
  const priorityValue = String(raw.priority ?? "medium");
  const statusValue = String(raw.status ?? "todo");

  return {
    id: String(raw.id),
    user_id: String(raw.user_id),
    title: String(raw.title ?? ""),
    description: raw.description ? String(raw.description) : null,
    status:
      statusValue === "progress" || statusValue === "done" ? statusValue : "todo",
    priority:
      priorityValue === "high" || priorityValue === "low" ? priorityValue : "medium",
    scope,
    company_id: companyId,
    category_id: categoryId,
    scheduled_for: scheduledFor,
    has_deadline: hasDeadline,
    deadline_at: hasDeadline ? deadlineAt : null,
    is_completed: Boolean(raw.is_completed) || statusValue === "done",
    created_at: String(raw.created_at ?? new Date().toISOString()),
    updated_at: raw.updated_at ? String(raw.updated_at) : null,
    company_name: company?.name ?? null,
    category_name: category?.name ?? null,
    task_type: raw.task_type ? String(raw.task_type) : null,
    due_date: raw.due_date ? String(raw.due_date) : null,
    reminder_days:
      typeof raw.reminder_days === "number" ? raw.reminder_days : raw.reminder_days ? Number(raw.reminder_days) : null,
  };
}

async function readCompanies(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
) {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .or(`user_id.is.null,user_id.eq.${userId}`)
    .order("name", { ascending: true });

  if (error) {
    return DEFAULT_COMPANIES;
  }

  const merged = [...DEFAULT_COMPANIES, ...((data ?? []) as CompanyRecord[])];
  const seen = new Set<string>();

  return merged.filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }
    seen.add(item.id);
    return true;
  });
}

async function readCategories(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
) {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .or(`user_id.is.null,user_id.eq.${userId}`)
    .order("domain", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    return DEFAULT_CATEGORIES;
  }

  const merged = [...DEFAULT_CATEGORIES, ...((data ?? []) as CategoryRecord[])];
  const seen = new Set<string>();

  return merged.filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }
    seen.add(item.id);
    return true;
  });
}

export async function getViewerData(): Promise<ViewerData> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [companies, categories] = await Promise.all([
    readCompanies(supabase, user.id),
    readCategories(supabase, user.id),
  ]);

  let taskQuery = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .order("scheduled_for", { ascending: true, nullsFirst: false })
    .order("deadline_at", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (taskQuery.error) {
    taskQuery = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("due_date", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });
  }

  if (taskQuery.error) {
    throw new Error(`Gagal mengambil task: ${taskQuery.error.message}`);
  }

  const tasks = (taskQuery.data ?? []).map((task) =>
    normalizeTaskRecord(task as Record<string, unknown>, companies, categories)
  );

  return {
    user,
    displayName: getDisplayName(user),
    companies,
    categories,
    tasks,
  };
}
