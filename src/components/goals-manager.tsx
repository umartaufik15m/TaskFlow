"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createGoalAction, deleteGoalAction, updateGoalProgressAction } from "@/app/personal-actions";
import { addSavingsContributionAction, createSavingsGoalAction } from "@/app/finance/actions";
import { formatMoney, type SavingsGoal } from "@/lib/finance";
import { GOAL_AREAS, type PersonalGoal } from "@/lib/personal";

export default function GoalsManager({ goals, savings }: { goals: PersonalGoal[]; savings: SavingsGoal[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  function runAction(action: () => Promise<unknown>, success: string) {
    setMessage("");
    startTransition(async () => {
      const result = await action();
      if (result && typeof result === "object" && "error" in result && typeof result.error === "string") {
        setMessage(result.error);
        return;
      }
      setMessage(success);
      router.refresh();
    });
  }

  return (
    <div className="goals-layout">
      {message ? <div className="notice-card surface">{message}</div> : null}

      <section id="new-goal" className="section-card surface-strong anchor-section">
        <p className="hero-label">Target baru</p>
        <h2 className="section-title">Apa yang mau lo capai?</h2>
        <form action={(formData) => runAction(() => createGoalAction(formData), "Target berhasil dibuat.")} className="inline-form mt-6">
          <div className="field"><label htmlFor="goal-title">Nama target</label><input id="goal-title" name="title" className="field-input" placeholder="Contoh: Lari 5K tanpa berhenti" required /></div>
          <div className="field"><label htmlFor="goal-description">Kenapa ini penting?</label><textarea id="goal-description" name="description" className="field-textarea" placeholder="Catatan singkat biar target tetap punya konteks." /></div>
          <div className="field-group two-col">
            <div className="field"><label htmlFor="goal-area">Area</label><select id="goal-area" name="area" className="field-select">{GOAL_AREAS.map((area) => <option key={area.value} value={area.value}>{area.label}</option>)}</select></div>
            <div className="field"><label htmlFor="goal-target-date">Target tanggal</label><input id="goal-target-date" name="target_date" type="date" className="field-input" /></div>
          </div>
          <button className="btn-primary" disabled={pending}>Buat target</button>
        </form>
      </section>

      <section className="section-card surface-strong">
        <p className="hero-label">Life goals</p>
        <h2 className="section-title">Target aktif</h2>
        <div className="goal-card-grid mt-6">
          {goals.length === 0 ? <div className="empty-card surface"><strong>Belum ada target.</strong><p>Pilih satu hal yang benar-benar berarti buat lo.</p></div> : goals.map((goal) => (
            <article key={goal.id} className={`goal-card surface ${goal.is_completed ? "is-done" : ""}`}>
              <div className="goal-card-head"><span>{GOAL_AREAS.find((area) => area.value === goal.area)?.label}</span><b>{goal.progress}%</b></div>
              <h3>{goal.title}</h3>
              {goal.description ? <p>{goal.description}</p> : null}
              <div className="finance-progress"><i style={{ width: `${goal.progress}%` }} /></div>
              <form action={(formData) => runAction(() => updateGoalProgressAction(goal.id, Number(formData.get("progress"))), "Progres diperbarui.")} className="goal-progress-form">
                <input name="progress" type="range" min="0" max="100" defaultValue={goal.progress} aria-label={`Progres ${goal.title}`} />
                <button className="btn-secondary" disabled={pending}>Update</button>
              </form>
              <button type="button" className="text-button" onClick={() => runAction(() => deleteGoalAction(goal.id), "Target dihapus.")} disabled={pending}>Hapus</button>
            </article>
          ))}
        </div>
      </section>

      <section className="section-card surface-strong savings-section">
        <div className="section-heading-row"><div><p className="hero-label">Money goal</p><h2 className="section-title">Target tabungan</h2></div><span className="settings-pill">Tetap goal, bukan anggaran</span></div>
        <div className="goal-card-grid mt-6">
          {savings.map((goal) => {
            const percent = Math.min(100, Math.round((goal.current_amount_minor / goal.target_amount_minor) * 100));
            return <article key={goal.id} className="goal-card surface"><div className="goal-card-head"><span>Tabungan</span><b>{percent}%</b></div><h3>{goal.name}</h3><p>{formatMoney(goal.current_amount_minor)} dari {formatMoney(goal.target_amount_minor)}</p><div className="finance-progress goal"><i style={{ width: `${percent}%` }} /></div><form action={(formData) => runAction(() => addSavingsContributionAction(goal.id, formData), "Tabungan bertambah.")} className="goal-progress-form"><input name="amount" inputMode="numeric" className="field-input" placeholder="Tambah rupiah" required /><button className="btn-secondary" disabled={pending}>Tambah</button></form></article>;
          })}
        </div>
        <details className="finance-disclosure" id="new-saving-goal">
          <summary>Buat target tabungan</summary>
          <form action={(formData) => runAction(() => createSavingsGoalAction(formData), "Target tabungan dibuat.")} className="inline-form">
            <div className="field"><label htmlFor="saving-name">Nama target</label><input id="saving-name" name="name" className="field-input" required /></div>
            <div className="field-group two-col"><div className="field"><label htmlFor="saving-target">Target rupiah</label><input id="saving-target" name="target_amount" inputMode="numeric" className="field-input" required /></div><div className="field"><label htmlFor="saving-current">Sudah ada</label><input id="saving-current" name="current_amount" inputMode="numeric" className="field-input" /></div></div>
            <div className="field"><label htmlFor="saving-date">Target tanggal</label><input id="saving-date" name="target_date" type="date" className="field-input" /></div>
            <button className="btn-primary" disabled={pending}>Simpan target tabungan</button>
          </form>
        </details>
      </section>
    </div>
  );
}
