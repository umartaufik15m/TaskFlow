import assert from "node:assert/strict";
import test from "node:test";
import {
  getAccountBalance,
  getBudgetUsage,
  getFinanceSummary,
  type FinanceData,
} from "../src/lib/finance";

const finance: FinanceData = {
  workspaceId: "workspace-1",
  workspaceName: "Rumah",
  setupRequired: false,
  accounts: [
    {
      id: "account-1",
      workspace_id: "workspace-1",
      name: "Bank",
      account_type: "bank",
      opening_balance_minor: 1_000_000,
      currency: "IDR",
    },
  ],
  categories: [
    {
      id: "category-food",
      workspace_id: "workspace-1",
      name: "Makanan",
      kind: "expense",
      color: "#fb7185",
    },
  ],
  transactions: [
    {
      id: "income-1",
      workspace_id: "workspace-1",
      account_id: "account-1",
      category_id: null,
      kind: "income",
      amount_minor: 2_000_000,
      currency: "IDR",
      description: "Gaji",
      transaction_date: "2026-08-01",
      is_recurring: false,
      created_at: "2026-08-01T00:00:00Z",
    },
    {
      id: "expense-1",
      workspace_id: "workspace-1",
      account_id: "account-1",
      category_id: "category-food",
      kind: "expense",
      amount_minor: 350_000,
      currency: "IDR",
      description: "Belanja",
      transaction_date: "2026-08-02",
      is_recurring: false,
      created_at: "2026-08-02T00:00:00Z",
    },
  ],
  budgets: [
    {
      id: "budget-1",
      workspace_id: "workspace-1",
      category_id: "category-food",
      month_key: "2026-08",
      amount_minor: 500_000,
      currency: "IDR",
    },
  ],
  goals: [],
  debts: [],
};

test("menghitung ringkasan arus kas bulanan", () => {
  assert.deepEqual(getFinanceSummary(finance, "2026-08"), {
    balance: 2_650_000,
    income: 2_000_000,
    expense: 350_000,
    cashflow: 1_650_000,
  });
});

test("menghitung saldo rekening dari saldo awal dan transaksi", () => {
  assert.equal(getAccountBalance(finance.accounts[0], finance.transactions), 2_650_000);
});

test("menghitung pemakaian dan sisa anggaran", () => {
  assert.deepEqual(getBudgetUsage(finance, finance.budgets[0]), {
    spent: 350_000,
    remaining: 150_000,
    percentage: 70,
  });
});
