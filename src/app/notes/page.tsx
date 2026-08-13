import type { Metadata } from "next";
import AppShell from "@/components/app-shell";
import NotesManager from "@/components/notes-manager";
import { getPersonalData } from "@/lib/personal-server";
import { getViewerData } from "@/lib/taskflow-server";

export const metadata: Metadata = { title: "Notes" };

export default async function NotesPage() {
  const [{ user, displayName }, personal] = await Promise.all([getViewerData(), getPersonalData()]);
  return <AppShell user={user} displayName={displayName} pageKey="notes" pageLabel="No structure required" pageTitle="Notes" pageDescription="Tempat bebas buat ide, briefing, daftar, atau apa pun yang belum menjadi task." heroMode="compact"><NotesManager notes={personal.notes} /></AppShell>;
}
