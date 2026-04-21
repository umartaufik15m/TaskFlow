import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDisplayName, type TaskRecord } from "@/lib/taskflow";

export async function getViewerData() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Gagal mengambil task: ${error.message}`);
  }

  return {
    supabase,
    user,
    displayName: getDisplayName(user),
    tasks: (data ?? []) as TaskRecord[],
  };
}
