import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { PersonalData, PersonalGoal, PersonalNote } from "@/lib/personal";

const EMPTY_PERSONAL: PersonalData = { goals: [], notes: [] };

export async function getPersonalData(): Promise<PersonalData> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [goalsQuery, notesQuery] = await Promise.all([
    supabase
      .from("personal_goals")
      .select("*")
      .eq("user_id", user.id)
      .order("is_completed")
      .order("target_date", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("personal_notes")
      .select("*")
      .eq("user_id", user.id)
      .order("is_pinned", { ascending: false })
      .order("updated_at", { ascending: false }),
  ]);

  if (goalsQuery.error || notesQuery.error) return EMPTY_PERSONAL;

  return {
    goals: (goalsQuery.data ?? []) as PersonalGoal[],
    notes: (notesQuery.data ?? []) as PersonalNote[],
  };
}
