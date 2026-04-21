"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  ACTIVITY_SCOPE_OPTIONS,
  CATEGORY_DOMAIN_OPTIONS,
  DEFAULT_COMPANY_ID,
  TASK_PRIORITY_OPTIONS,
  TASK_STATUS_OPTIONS,
  normalizeDateTimeInput,
  type ActivityScope,
  type CategoryDomain,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/taskflow";

const APP_PATHS = ["/", "/today", "/planner", "/focus", "/settings"];

function revalidateApp() {
  for (const path of APP_PATHS) {
    revalidatePath(path);
  }
}

function pickStatus(value: string): TaskStatus {
  return TASK_STATUS_OPTIONS.includes(value as TaskStatus)
    ? (value as TaskStatus)
    : "todo";
}

function pickPriority(value: string): TaskPriority {
  return TASK_PRIORITY_OPTIONS.includes(value as TaskPriority)
    ? (value as TaskPriority)
    : "medium";
}

function pickScope(value: string): ActivityScope {
  return ACTIVITY_SCOPE_OPTIONS.includes(value as ActivityScope)
    ? (value as ActivityScope)
    : "personal";
}

function pickDomain(value: string): CategoryDomain {
  return CATEGORY_DOMAIN_OPTIONS.includes(value as CategoryDomain)
    ? (value as CategoryDomain)
    : "personal";
}

async function requireViewer() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Sesi login tidak ditemukan.");
  }

  return { supabase, user };
}

function readTaskPayload(formData: FormData) {
  const scope = pickScope(String(formData.get("scope") ?? "personal"));
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const priority = pickPriority(String(formData.get("priority") ?? "medium"));
  const companyIdRaw = String(formData.get("company_id") ?? "").trim();
  const categoryId = String(formData.get("category_id") ?? "").trim();
  const scheduledFor = normalizeDateTimeInput(String(formData.get("scheduled_for") ?? "").trim());
  const hasDeadline = String(formData.get("has_deadline") ?? "") === "on";
  const deadlineAt = normalizeDateTimeInput(String(formData.get("deadline_at") ?? "").trim());
  const status = pickStatus(String(formData.get("status") ?? "todo"));
  const companyId = scope === "work" ? companyIdRaw || DEFAULT_COMPANY_ID : DEFAULT_COMPANY_ID;

  if (!title) {
    return { error: "Judul wajib diisi." };
  }

  if (!categoryId) {
    return { error: "Kategori wajib dipilih." };
  }

  if (!scheduledFor) {
    return { error: "Jadwal pelaksanaan wajib diisi." };
  }

  if (scope === "work" && !companyId) {
    return { error: "Perusahaan wajib dipilih untuk task kerja." };
  }

  if (scope === "work" && hasDeadline && !deadlineAt) {
    return { error: "Deadline wajib diisi jika task ini punya deadline." };
  }

  return {
    payload: {
      title,
      description: description || null,
      scope,
      priority,
      status,
      company_id: companyId,
      category_id: categoryId,
      scheduled_for: scheduledFor,
      has_deadline: scope === "work" ? hasDeadline : false,
      deadline_at: scope === "work" && hasDeadline ? deadlineAt : null,
      due_date: scope === "work" && hasDeadline ? deadlineAt : null,
      is_completed: status === "done",
    },
  };
}

export async function createTaskAction(formData: FormData) {
  const { supabase, user } = await requireViewer();
  const result = readTaskPayload(formData);

  if ("error" in result) {
    return result;
  }

  const { error } = await supabase.from("tasks").insert({
    user_id: user.id,
    ...result.payload,
  });

  if (error) {
    return { error: error.message };
  }

  revalidateApp();
  return { success: true };
}

export async function updateTaskAction(formData: FormData) {
  const { supabase, user } = await requireViewer();
  const id = String(formData.get("id") ?? "").trim();
  const result = readTaskPayload(formData);

  if (!id) {
    return { error: "Task tidak valid." };
  }

  if ("error" in result) {
    return result;
  }

  const { error } = await supabase
    .from("tasks")
    .update(result.payload)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidateApp();
  return { success: true };
}

export async function deleteTaskAction(id: string) {
  const { supabase, user } = await requireViewer();

  if (!id.trim()) {
    return { error: "Task tidak ditemukan." };
  }

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidateApp();
  return { success: true };
}

export async function toggleTaskAction(id: string, current: boolean, fallbackStatus = "todo") {
  const { supabase, user } = await requireViewer();

  if (!id.trim()) {
    return { error: "Task tidak ditemukan." };
  }

  const nextCompleted = !current;
  const nextStatus = nextCompleted ? "done" : pickStatus(fallbackStatus);

  const { error } = await supabase
    .from("tasks")
    .update({
      is_completed: nextCompleted,
      status: nextStatus,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidateApp();
  return { success: true };
}

export async function startTaskAction(id: string) {
  const { supabase, user } = await requireViewer();

  if (!id.trim()) {
    return { error: "Task tidak ditemukan." };
  }

  const { error } = await supabase
    .from("tasks")
    .update({
      status: "progress",
      is_completed: false,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidateApp();
  return { success: true };
}

export async function createCompanyAction(formData: FormData) {
  const { supabase, user } = await requireViewer();
  const name = String(formData.get("name") ?? "").trim();

  if (!name) {
    return { error: "Nama perusahaan wajib diisi." };
  }

  const { error } = await supabase.from("companies").insert({
    id: crypto.randomUUID(),
    user_id: user.id,
    name,
  });

  if (error) {
    return { error: error.message };
  }

  revalidateApp();
  return { success: true };
}

export async function updateCompanyAction(formData: FormData) {
  const { supabase, user } = await requireViewer();
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();

  if (!id || !name) {
    return { error: "Perusahaan tidak valid." };
  }

  const { error } = await supabase
    .from("companies")
    .update({ name })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidateApp();
  return { success: true };
}

export async function deleteCompanyAction(id: string) {
  const { supabase, user } = await requireViewer();

  if (!id || id === DEFAULT_COMPANY_ID) {
    return { error: "Perusahaan ini tidak bisa dihapus." };
  }

  const { error } = await supabase
    .from("companies")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidateApp();
  return { success: true };
}

export async function createCategoryAction(formData: FormData) {
  const { supabase, user } = await requireViewer();
  const name = String(formData.get("name") ?? "").trim();
  const domain = pickDomain(String(formData.get("domain") ?? "personal"));

  if (!name) {
    return { error: "Nama kategori wajib diisi." };
  }

  const { error } = await supabase.from("categories").insert({
    id: crypto.randomUUID(),
    user_id: user.id,
    name,
    domain,
  });

  if (error) {
    return { error: error.message };
  }

  revalidateApp();
  return { success: true };
}

export async function updateCategoryAction(formData: FormData) {
  const { supabase, user } = await requireViewer();
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const domain = pickDomain(String(formData.get("domain") ?? "personal"));

  if (!id || !name) {
    return { error: "Kategori tidak valid." };
  }

  const { error } = await supabase
    .from("categories")
    .update({ name, domain })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidateApp();
  return { success: true };
}

export async function deleteCategoryAction(id: string) {
  const { supabase, user } = await requireViewer();

  if (!id || id.startsWith("category-")) {
    return { error: "Kategori bawaan tidak bisa dihapus." };
  }

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidateApp();
  return { success: true };
}

export async function updateProfileAction(formData: FormData) {
  const { supabase } = await requireViewer();
  const username = String(formData.get("username") ?? "").trim();

  if (!username) {
    return { error: "Nama akun wajib diisi." };
  }

  const { error } = await supabase.auth.updateUser({
    data: {
      username,
    },
  });

  if (error) {
    return { error: error.message };
  }

  revalidateApp();
  return { success: true };
}

export async function updatePasswordAction(formData: FormData) {
  const { supabase } = await requireViewer();
  const password = String(formData.get("password") ?? "").trim();
  const confirmPassword = String(formData.get("confirm_password") ?? "").trim();

  if (password.length < 6) {
    return { error: "Password minimal 6 karakter." };
  }

  if (password !== confirmPassword) {
    return { error: "Konfirmasi password belum sama." };
  }

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidateApp();
  return { success: true };
}
