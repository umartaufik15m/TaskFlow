export type PersonalGoalArea = "personal" | "work" | "health" | "learning";

export type PersonalGoal = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  area: PersonalGoalArea;
  progress: number;
  target_date: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
};

export type PersonalNote = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
};

export type PersonalData = {
  goals: PersonalGoal[];
  notes: PersonalNote[];
};

export const GOAL_AREAS: Array<{ value: PersonalGoalArea; label: string }> = [
  { value: "personal", label: "Pribadi" },
  { value: "work", label: "Kerja" },
  { value: "health", label: "Kesehatan" },
  { value: "learning", label: "Belajar" },
];
