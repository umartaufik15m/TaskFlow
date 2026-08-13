import Link from "next/link";
import AppShell from "@/components/app-shell";
import LiveDateTime from "@/components/live-date-time";
import { getFinanceViewerData } from "@/lib/finance-server";
import { formatMoney, getFinanceSummary } from "@/lib/finance";
import { getPersonalData } from "@/lib/personal-server";
import { getViewerData } from "@/lib/taskflow-server";
import { getDeadlineValue, sortTasksForFocus, toDateKey, toLocalDateKey } from "@/lib/taskflow";

export default async function HomePage() {
  const [{ user, displayName, tasks }, personal, { finance }] = await Promise.all([
    getViewerData(),
    getPersonalData(),
    getFinanceViewerData(),
  ]);
  const active = tasks.filter((task) => task.status !== "done" && !task.is_completed);
  const topThree = sortTasksForFocus(active).slice(0, 3);
  const todayKey = toDateKey(new Date());
  const deadlines = active.filter((task) => {
    const value = getDeadlineValue(task);
    return value && toLocalDateKey(value) <= todayKey;
  }).slice(0, 4);
  const activeGoals = personal.goals.filter((goal) => !goal.is_completed).slice(0, 3);
  const money = getFinanceSummary(finance);
  const remainingDebt = finance.debts.reduce((total, debt) => total + (debt.status === "active" ? debt.total_amount_minor - debt.paid_amount_minor : 0), 0);

  return (
    <AppShell user={user} displayName={displayName} pageKey="home" heroMode="hidden">
      <section className="home-hero acid-panel">
        <div><p className="hero-label">Personal command center</p><h1>Hari ini,<br /><em>{displayName}.</em></h1><div className="home-date"><LiveDateTime /></div></div>
        <div className="diametral-symbol" aria-hidden="true"><span /></div>
      </section>

      <div className="home-bento">
        <section className="section-card surface-strong home-priority-card">
          <div className="section-heading-row"><div><p className="hero-label">Top 3</p><h2 className="section-title">Yang paling penting</h2></div><Link href="/tasks" className="text-link">Semua task →</Link></div>
          <div className="home-list">
            {topThree.length ? topThree.map((task, index) => <Link href="/tasks" key={task.id} className="home-list-item"><span>0{index + 1}</span><div><strong>{task.title}</strong><small>{task.priority === "high" ? "Prioritas tinggi" : task.category_name ?? "Task"}</small></div></Link>) : <div className="empty-card"><strong>Hari ini masih kosong.</strong><p>Tambah task pertama lo.</p></div>}
          </div>
        </section>

        <section className="section-card pink-panel home-deadline-card">
          <p className="hero-label">Deadline radar</p><strong className="hero-number">{deadlines.length}</strong><p>{deadlines.length ? "hal perlu perhatian sekarang" : "Tidak ada yang lewat deadline"}</p>
          {deadlines.slice(0, 2).map((task) => <span key={task.id}>{task.title}</span>)}
        </section>

        <section className="section-card surface-strong">
          <div className="section-heading-row"><div><p className="hero-label">Goals</p><h2 className="section-title">Gerak pelan, tetap gerak</h2></div><Link href="/goals" className="text-link">Lihat →</Link></div>
          <div className="mini-goals mt-6">{activeGoals.length ? activeGoals.map((goal) => <div key={goal.id}><div><strong>{goal.title}</strong><span>{goal.progress}%</span></div><div className="finance-progress"><i style={{ width: `${goal.progress}%` }} /></div></div>) : <p className="section-copy">Belum ada target aktif.</p>}</div>
        </section>

        <Link href="/money" className="section-card money-snapshot">
          <p className="hero-label">Money snapshot</p><span>Saldo sekarang</span><strong>{formatMoney(money.balance)}</strong><div><small>Cashflow bulan ini {formatMoney(money.cashflow)}</small><small>Hutang tersisa {formatMoney(remainingDebt)}</small></div>
        </Link>
      </div>
    </AppShell>
  );
}
