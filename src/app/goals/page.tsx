import type { Metadata } from "next";
import AppShell from "@/components/app-shell";
import GoalsManager from "@/components/goals-manager";
import { getFinanceViewerData } from "@/lib/finance-server";
import { getPersonalData } from "@/lib/personal-server";

export const metadata: Metadata = { title: "Goals" };

export default async function GoalsPage() {
  const [{ user, displayName, finance }, personal] = await Promise.all([getFinanceViewerData(), getPersonalData()]);
  return <AppShell user={user} displayName={displayName} pageKey="goals" pageLabel="Direction over pressure" pageTitle="Goals" pageDescription="Target hidup dan target tabungan ada di sini. Task harian tetap tinggal di Tasks." heroMode="compact"><GoalsManager goals={personal.goals} savings={finance.goals} /></AppShell>;
}
