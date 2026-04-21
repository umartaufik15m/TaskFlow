import AppShell from "@/components/app-shell";
import SettingsManager from "@/components/settings-manager";
import { getViewerData } from "@/lib/taskflow-server";

export default async function SettingsPage() {
  const { user, displayName, companies, categories } = await getViewerData();

  return (
    <AppShell
      user={user}
      displayName={displayName}
      pageKey="settings"
      pageLabel="Settings"
      pageTitle="Pengaturan"
      heroMode="compact"
    >
      <SettingsManager
        currentUsername={displayName}
        companies={companies}
        categories={categories}
      />
    </AppShell>
  );
}
