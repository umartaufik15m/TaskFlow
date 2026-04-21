"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  normalizeDueDate,
  TASK_KIND_OPTIONS,
  TASK_PRIORITY_OPTIONS,
  TASK_STATUS_OPTIONS,
  type TaskKind,
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

function pickKind(value: string): TaskKind {
  return TASK_KIND_OPTIONS.includes(value as TaskKind)
    ? (value as TaskKind)
    : "task";
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
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const status = pickStatus(String(formData.get("status") ?? "todo").trim());
  const priority = pickPriority(String(formData.get("priority") ?? "medium").trim());
  const taskType = pickKind(String(formData.get("task_type") ?? "task").trim());
  const dueDate = normalizeDueDate(String(formData.get("due_date") ?? ""));
  const reminderRaw = String(formData.get("reminder_days") ?? "").trim();

  const reminderDays =
    reminderRaw === "" ? null : Math.max(0, Math.floor(Number(reminderRaw) || 0));

  return {
    title,
    description: description || null,
    status,
    priority,
    task_type: taskType,
    due_date: dueDate,
    reminder_days: reminderDays,
  };
}

export async function createTaskAction(formData: FormData) {
  const { supabase, user } = await requireViewer();
  const payload = readTaskPayload(formData);

  if (!payload.title) {
    return { error: "Judul task wajib diisi." };
  }

  const { error } = await supabase.from("tasks").insert({
    user_id: user.id,
    ...payload,
    is_completed: payload.status === "done",
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
  const payload = readTaskPayload(formData);

  if (!id || !payload.title) {
    return { error: "Task tidak valid." };
  }

  const { error } = await supabase
    .from("tasks")
    .update({
      ...payload,
      is_completed: payload.status === "done",
    })
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

export async function toggleTaskAction(id: string, current: boolean) {
  const { supabase, user } = await requireViewer();

  if (!id.trim()) {
    return { error: "Task tidak ditemukan." };
  }

  const nextCompleted = !current;
  const nextStatus: TaskStatus = nextCompleted ? "done" : "todo";

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

export async function markTaskInProgressAction(id: string) {
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
