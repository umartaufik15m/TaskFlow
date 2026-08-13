"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createDebtAction, payDebtAction } from "@/app/finance/actions";
import { formatMoney, type FinanceData } from "@/lib/finance";

function todayValue() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export default function DebtManager({ finance }: { finance: FinanceData }) {
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

  const activeDebt = finance.debts.filter((debt) => debt.status === "active").reduce((total, debt) => total + debt.total_amount_minor - debt.paid_amount_minor, 0);

  return (
    <section id="new-debt" className="section-card surface-strong debt-section anchor-section">
      <div className="section-heading-row"><div><p className="hero-label">Debt tracker</p><h2 className="section-title">Hutang</h2></div><strong className="debt-total">Sisa {formatMoney(activeDebt)}</strong></div>
      <p className="section-copy">Sekali bayar, saldo rekening dan sisa hutang langsung turun bersama.</p>
      {message ? <div className="notice-card surface mt-4">{message}</div> : null}

      <div className="debt-grid mt-6">
        {finance.debts.length === 0 ? <div className="empty-card surface"><strong>Belum ada hutang.</strong><p>Bagus. Kalau perlu dicatat, form-nya ada di bawah.</p></div> : finance.debts.map((debt) => {
          const remaining = debt.total_amount_minor - debt.paid_amount_minor;
          const percent = Math.round((debt.paid_amount_minor / debt.total_amount_minor) * 100);
          return <article key={debt.id} className={`debt-card surface ${debt.status === "paid" ? "is-paid" : ""}`}><div className="goal-card-head"><span>{debt.status === "paid" ? "LUNAS" : debt.due_date ? `Jatuh tempo ${debt.due_date}` : "AKTIF"}</span><b>{percent}%</b></div><h3>{debt.creditor}</h3>{debt.description ? <p>{debt.description}</p> : null}<strong>{formatMoney(remaining)} tersisa</strong><div className="finance-progress"><i style={{ width: `${percent}%` }} /></div>{debt.status === "active" ? <form action={(formData) => runAction(() => payDebtAction(debt.id, formData), "Pembayaran tercatat. Saldo dan hutang sudah diperbarui.")} className="inline-form"><div className="field-group two-col"><div className="field"><label>Bayar dari</label><select name="account_id" className="field-select" required>{finance.accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}</select></div><div className="field"><label>Nominal</label><input name="amount" inputMode="numeric" className="field-input" max={remaining} required /></div></div><input name="payment_date" type="hidden" value={todayValue()} /><button className="btn-primary" disabled={pending || finance.accounts.length === 0}>Bayar hutang</button></form> : null}</article>;
        })}
      </div>

      <details className="finance-disclosure">
        <summary>Catat hutang baru</summary>
        <form action={(formData) => runAction(() => createDebtAction(formData), "Hutang berhasil dicatat.")} className="inline-form">
          <div className="field-group two-col"><div className="field"><label htmlFor="debt-creditor">Hutang ke siapa?</label><input id="debt-creditor" name="creditor" className="field-input" required /></div><div className="field"><label htmlFor="debt-total">Total hutang</label><input id="debt-total" name="total_amount" inputMode="numeric" className="field-input" required /></div></div>
          <div className="field"><label htmlFor="debt-description">Catatan</label><input id="debt-description" name="description" className="field-input" placeholder="Contoh: cicilan laptop" /></div>
          <div className="field"><label htmlFor="debt-due">Jatuh tempo</label><input id="debt-due" name="due_date" type="date" className="field-input" /></div>
          <button className="btn-primary" disabled={pending}>Simpan hutang</button>
        </form>
      </details>
    </section>
  );
}
