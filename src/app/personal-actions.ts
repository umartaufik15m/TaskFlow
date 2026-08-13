"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { GOAL_AREAS, type PersonalGoalArea } from "@/lib/personal";

export type PersonalActionResult = { success: true } | { error: string };

async function requireViewer() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? { supabase, user } : null;
}

function refreshPersonal() {
  revalidatePath("/");
  revalidatePath("/goals");
  revalidatePath("/notes");
}

export async function createGoalAction(formData: FormData): Promise<PersonalActionResult> {
  const context = await requireViewer();
  if (!context) return { error: "Sesi login tidak ditemukan." };

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const rawArea = String(formData.get("area") ?? "personal");
  const area = GOAL_AREAS.some((item) => item.value === rawArea)
    ? (rawArea as PersonalGoalArea)
    : "personal";
  const targetDate = String(formData.get("target_date") ?? "").trim() || null;

  if (!title) return { error: "Nama target wajib diisi." };

  const { error } = await context.supabase.from("personal_goals").insert({
    user_id: context.user.id,
    title,
    description,
    area,
    target_date: targetDate,
  });

  if (error) return { error: error.message };
  refreshPersonal();
  return { success: true };
}

export async function updateGoalProgressAction(
  id: string,
  progress: number
): Promise<PersonalActionResult> {
  const context = await requireViewer();
  if (!context) return { error: "Sesi login tidak ditemukan." };

  const safeProgress = Math.max(0, Math.min(100, Math.round(progress)));
  const { error } = await context.supabase
    .from("personal_goals")
    .update({
      progress: safeProgress,
      is_completed: safeProgress === 100,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", context.user.id);

  if (error) return { error: error.message };
  refreshPersonal();
  return { success: true };
}

export async function deleteGoalAction(id: string): Promise<PersonalActionResult> {
  const context = await requireViewer();
  if (!context) return { error: "Sesi login tidak ditemukan." };
  const { error } = await context.supabase
    .from("personal_goals")
    .delete()
    .eq("id", id)
    .eq("user_id", context.user.id);
  if (error) return { error: error.message };
  refreshPersonal();
  return { success: true };
}

export async function createNoteAction(formData: FormData): Promise<PersonalActionResult> {
  const context = await requireViewer();
  if (!context) return { error: "Sesi login tidak ditemukan." };

  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  if (!title) return { error: "Judul catatan wajib diisi." };

  const { error } = await context.supabase.from("personal_notes").insert({
    user_id: context.user.id,
    title,
    content,
  });
  if (error) return { error: error.message };
  refreshPersonal();
  return { success: true };
}

export async function toggleNotePinAction(
  id: string,
  isPinned: boolean
): Promise<PersonalActionResult> {
  const context = await requireViewer();
  if (!context) return { error: "Sesi login tidak ditemukan." };
  const { error } = await context.supabase
    .from("personal_notes")
    .update({ is_pinned: !isPinned, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", context.user.id);
  if (error) return { error: error.message };
  refreshPersonal();
  return { success: true };
}

export async function deleteNoteAction(id: string): Promise<PersonalActionResult> {
  const context = await requireViewer();
  if (!context) return { error: "Sesi login tidak ditemukan." };
  const { error } = await context.supabase
    .from("personal_notes")
    .delete()
    .eq("id", id)
    .eq("user_id", context.user.id);
  if (error) return { error: error.message };
  refreshPersonal();
  return { success: true };
}
