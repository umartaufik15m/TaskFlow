"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createFinanceAccountAction,
  createFinanceCategoryAction,
  createFinanceTransactionAction,
  deleteFinanceTransactionAction,
  upsertFinanceBudgetAction,
  type FinanceActionResult,
} from "@/app/finance/actions";
import {
  currentMonthKey,
  formatMoney,
  getAccountBalance,
  getBudgetUsage,
  getFinanceSummary,
  type FinanceData,
  type FinanceKind,
} from "@/lib/finance";

type FinanceManagerProps = {
  finance: FinanceData;
};

function todayInputValue() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;
}

function transactionSign(kind: FinanceKind) {
  return kind === "income" ? "+" : "-";
}

export default function FinanceManager({ finance }: FinanceManagerProps) {
  const router = useRouter();
  const transactionForm = useRef<HTMLFormElement>(null);
  const [kind, setKind] = useState<FinanceKind>("expense");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, startTransition] = useTransition();
  const summary = useMemo(() => getFinanceSummary(finance), [finance]);
  const transactionCategories = finance.categories.filter((category) => category.kind === kind);
  const expenseCategories = finance.categories.filter((category) => category.kind === "expense");

  function runAction(
    action: () => Promise<FinanceActionResult>,
    successMessage: string,
    onSuccess?: () => void
  ) {
    setError("");
    setNotice("");
    startTransition(async () => {
      const result = await action();
      if ("error" in result) {
        setError(result.error);
        return;
      }
      onSuccess?.();
      setNotice(successMessage);
      router.refresh();
    });
  }

  if (finance.setupRequired) {
    return (
      <section className="finance-setup surface-strong">
        <div className="finance-orb" aria-hidden="true" />
        <p className="hero-label">Satu langkah lagi</p>
        <h2 className="section-title">Aktifkan pondasi keuangan yang aman</h2>
        <p className="section-copy">
          Halaman sudah siap, tetapi tabel workspace, transaksi, dan kebijakan akses belum ada di
          database. Jalankan migration terbaru di Supabase, lalu muat ulang halaman ini.
        </p>
        <code>supabase/migrations/20260813_finance_workspace_security.sql</code>
      </section>
    );
  }

  return (
    <div className="finance-stack">
      <section className="finance-overview">
        <article className="finance-balance-card surface-strong">
          <span className="finance-kicker">Saldo bersih</span>
          <strong>{formatMoney(summary.balance)}</strong>
          <p>{finance.workspaceName} Ã‚Â· IDR</p>
          <div className="finance-balance-glow" aria-hidden="true" />
        </article>

        <article className="finance-stat surface">
          <span>Pemasukan bulan ini</span>
          <strong className="is-success">{formatMoney(summary.income)}</strong>
        </article>
        <article className="finance-stat surface">
          <span>Pengeluaran bulan ini</span>
          <strong className="is-danger">{formatMoney(summary.expense)}</strong>
        </article>
        <article className="finance-stat surface">
          <span>Arus kas</span>
          <strong className={summary.cashflow >= 0 ? "is-success" : "is-danger"}>
            {formatMoney(summary.cashflow)}
          </strong>
        </article>
      </section>

      {error ? <div className="notice-card is-error" role="alert">{error}</div> : null}
      {notice ? <div className="notice-card is-success" role="status">{notice}</div> : null}

      <section className="finance-main-grid">
        <div id="new-transaction" className="section-card surface-strong finance-entry-card anchor-section">
          <div className="section-heading-row">
            <div>
              <p className="hero-label">Quick entry</p>
              <h2 className="section-title">Catat transaksi</h2>
            </div>
            <span className="finance-secure-pill">Data pribadi</span>
          </div>

          {finance.accounts.length === 0 ? (
            <div className="empty-card surface">
              <strong>Buat rekening pertama lebih dahulu.</strong>
              <p>Rekening dipakai untuk menghitung saldo kas, bank, dan e-wallet.</p>
            </div>
          ) : (
            <form
              ref={transactionForm}
              action={(formData) =>
                runAction(
                  () => createFinanceTransactionAction(formData),
                  "Transaksi berhasil dicatat.",
                  () => transactionForm.current?.reset()
                )
              }
              className="inline-form"
            >
              <div className="scope-switch">
                <button
                  type="button"
                  onClick={() => setKind("expense")}
                  className={kind === "expense" ? "theme-pill is-active" : "theme-pill"}
                >
                  <span>Pengeluaran</span>
                  <small>Uang keluar dari rekening</small>
                </button>
                <button
                  type="button"
                  onClick={() => setKind("income")}
                  className={kind === "income" ? "theme-pill is-active" : "theme-pill"}
                >
                  <span>Pemasukan</span>
                  <small>Uang masuk ke rekening</small>
                </button>
              </div>
              <input type="hidden" name="kind" value={kind} />

              <div className="field-group two-col">
                <div className="field">
                  <label htmlFor="finance-account">Rekening</label>
                  <select id="finance-account" name="account_id" className="field-select" required>
                    {finance.accounts.map((account) => (
                      <option key={account.id} value={account.id}>{account.name}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="finance-category">Kategori</label>
                  <select key={kind} id="finance-category" name="category_id" className="field-select">
                    <option value="">Tanpa kategori</option>
                    {transactionCategories.map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="field-group two-col">
                <div className="field">
                  <label htmlFor="finance-amount">Nominal rupiah</label>
                  <input id="finance-amount" name="amount" inputMode="numeric" className="field-input" placeholder="Contoh: 250000" required />
                </div>
                <div className="field">
                  <label htmlFor="finance-date">Tanggal</label>
                  <input id="finance-date" name="transaction_date" type="date" defaultValue={todayInputValue()} className="field-input" required />
                </div>
              </div>

              <div className="field">
                <label htmlFor="finance-description">Keterangan</label>
                <input id="finance-description" name="description" className="field-input" placeholder="Contoh: Belanja mingguan" maxLength={160} required />
              </div>

              <label className="checkbox-line">
                <input type="checkbox" name="is_recurring" />
                <span>Transaksi berulang</span>
              </label>

              <button type="submit" className="btn-primary" disabled={pending}>
                {pending ? "Menyimpan..." : "Simpan transaksi"}
              </button>
            </form>
          )}
        </div>

        <aside className="finance-side-stack">
          <div className="section-card surface-strong">
            <p className="hero-label">Rekening</p>
            <div className="finance-account-list">
              {finance.accounts.map((account) => (
                <div key={account.id} className="finance-account-row surface">
                  <div>
                    <span>{account.account_type}</span>
                    <strong>{account.name}</strong>
                  </div>
                  <b>{formatMoney(getAccountBalance(account, finance.transactions))}</b>
                </div>
              ))}
            </div>
            <details className="finance-disclosure">
              <summary>Tambah rekening</summary>
              <form action={(formData) => runAction(() => createFinanceAccountAction(formData), "Rekening berhasil dibuat.")} className="inline-form">
                <div className="field"><label htmlFor="account-name">Nama</label><input id="account-name" name="name" className="field-input" required /></div>
                <div className="field"><label htmlFor="account-type">Jenis</label><select id="account-type" name="account_type" className="field-select"><option value="cash">Kas</option><option value="bank">Bank</option><option value="ewallet">E-wallet</option><option value="investment">Investasi</option></select></div>
                <div className="field"><label htmlFor="opening-balance">Saldo awal</label><input id="opening-balance" name="opening_balance" inputMode="numeric" className="field-input" placeholder="0" /></div>
                <button className="btn-secondary" disabled={pending}>Tambah rekening</button>
              </form>
            </details>
          </div>

          <div className="section-card surface-strong">
            <p className="hero-label">Kategori custom</p>
            <details className="finance-disclosure">
              <summary>Tambah kategori</summary>
              <form action={(formData) => runAction(() => createFinanceCategoryAction(formData), "Kategori berhasil dibuat.")} className="inline-form">
                <div className="field"><label htmlFor="category-name">Nama</label><input id="category-name" name="name" className="field-input" required /></div>
                <div className="field-group two-col">
                  <div className="field"><label htmlFor="category-kind">Jenis</label><select id="category-kind" name="kind" className="field-select"><option value="expense">Pengeluaran</option><option value="income">Pemasukan</option></select></div>
                  <div className="field"><label htmlFor="category-color">Warna</label><input id="category-color" name="color" type="color" defaultValue="#8b5cf6" className="field-input color-input" /></div>
                </div>
                <button className="btn-secondary" disabled={pending}>Tambah kategori</button>
              </form>
            </details>
          </div>
        </aside>
      </section>

      <section className="finance-budget-section">
        <div className="section-card surface-strong">
          <div className="section-heading-row"><div><p className="hero-label">Monthly guardrail</p><h2 className="section-title">Anggaran</h2></div></div>
          <div className="finance-budget-list">
            {finance.budgets.map((budget) => {
              const usage = getBudgetUsage(finance, budget);
              const category = finance.categories.find((item) => item.id === budget.category_id);
              return (
                <div key={budget.id} className="finance-budget-item">
                  <div className="finance-budget-label"><strong>{category?.name ?? "Kategori"}</strong><span>{formatMoney(usage.spent)} / {formatMoney(budget.amount_minor)}</span></div>
                  <div className="finance-progress"><i style={{ width: `${usage.percentage}%` }} /></div>
                  <small className={usage.remaining < 0 ? "is-danger" : ""}>{usage.remaining < 0 ? `Melebihi ${formatMoney(Math.abs(usage.remaining))}` : `Sisa ${formatMoney(usage.remaining)}`}</small>
                </div>
              );
            })}
          </div>
          <details className="finance-disclosure">
            <summary>Atur anggaran</summary>
            <form action={(formData) => runAction(() => upsertFinanceBudgetAction(formData), "Anggaran berhasil disimpan.")} className="inline-form">
              <div className="field"><label htmlFor="budget-category">Kategori pengeluaran</label><select id="budget-category" name="category_id" className="field-select" required>{expenseCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div>
              <div className="field-group two-col"><div className="field"><label htmlFor="budget-month">Bulan</label><input id="budget-month" name="month_key" type="month" defaultValue={currentMonthKey()} className="field-input" required /></div><div className="field"><label htmlFor="budget-amount">Batas rupiah</label><input id="budget-amount" name="amount" inputMode="numeric" className="field-input" required /></div></div>
              <button className="btn-secondary" disabled={pending}>Simpan anggaran</button>
            </form>
          </details>
        </div>

      </section>

      <section className="section-card surface-strong">
        <div className="section-heading-row"><div><p className="hero-label">Ledger</p><h2 className="section-title">Transaksi terbaru</h2></div><span className="settings-pill">Maks. 100 catatan</span></div>
        <div className="finance-transaction-list">
          {finance.transactions.length === 0 ? <div className="empty-card surface"><strong>Belum ada transaksi.</strong><p>Catatan pertama akan tampil di sini.</p></div> : finance.transactions.map((transaction) => {
            const account = finance.accounts.find((item) => item.id === transaction.account_id);
            const category = finance.categories.find((item) => item.id === transaction.category_id);
            return <article key={transaction.id} className="finance-transaction-row"><span className={`finance-transaction-icon is-${transaction.kind}`}>{transactionSign(transaction.kind)}</span><div><strong>{transaction.description}</strong><span>{transaction.transaction_date} · {account?.name ?? "Rekening"} · {category?.name ?? "Lainnya"}</span></div><b className={transaction.kind === "income" ? "is-success" : "is-danger"}>{transactionSign(transaction.kind)}{formatMoney(transaction.amount_minor)}</b><button type="button" className="finance-delete" onClick={() => runAction(() => deleteFinanceTransactionAction(transaction.id), "Transaksi dihapus.")} disabled={pending} aria-label={`Hapus ${transaction.description}`}>×</button></article>;
          })}
        </div>
      </section>
    </div>
  );
}
