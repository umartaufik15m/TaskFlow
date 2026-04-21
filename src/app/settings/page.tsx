import AppShell from "@/components/app-shell";
import ThemeToggle from "@/components/ThemeToggle";
import { getViewerData } from "@/lib/taskflow-server";
import { getTaskCounts } from "@/lib/taskflow";

export default async function SettingsPage() {
  const { user, displayName, tasks } = await getViewerData();
  const counts = getTaskCounts(tasks);

  return (
    <AppShell
      user={user}
      displayName={displayName}
      pageKey="settings"
      pageLabel="Settings"
      pageTitle="Atur tampilan, lihat ringkasan akun, dan jaga board tetap nyaman."
      pageDescription="Tidak dibuat rumit. Halaman ini cukup untuk ganti nuansa visual dan melihat kondisi board secara cepat."
    >
      <section className="section-grid two-col">
        <div className="section-card surface-strong">
          <h2 className="section-title">Tema board</h2>
          <p className="section-copy">
            Pilih dua mode: Spiderman merah-hitam untuk dark atau Lotus soft pink untuk light.
          </p>

          <div className="mt-6">
            <ThemeToggle />
          </div>
        </div>

        <div className="section-card surface-strong">
          <h2 className="section-title">Ringkasan akun</h2>
          <p className="section-copy">
            Dipakai pribadi, jadi saya bikin tampilannya lebih hangat dan langsung ke kebutuhan sehari-hari.
          </p>

          <div className="task-grid mt-6">
            <div className="section-card surface">
              <p className="hero-label">Nama tampil</p>
              <h3 className="mt-3 text-2xl font-black">{displayName}</h3>
              <p className="section-copy">{user.email}</p>
            </div>

            <div className="section-card surface">
              <p className="hero-label">Isi board</p>
              <h3 className="mt-3 text-2xl font-black">{tasks.length} task total</h3>
              <p className="section-copy">
                {counts.active.length} aktif, {counts.progress.length} sedang jalan, {counts.completed.length} selesai.
              </p>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
