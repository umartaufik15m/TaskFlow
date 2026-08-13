export const FINANCE_ACCOUNT_TYPES = ["cash", "bank", "ewallet", "investment"] as const;
export const FINANCE_KINDS = ["income", "expense"] as const;

export type FinanceAccountType = (typeof FINANCE_ACCOUNT_TYPES)[number];
export type FinanceKind = (typeof FINANCE_KINDS)[number];

export type FinanceAccount = {
  id: string;
  workspace_id: string;
  name: string;
  account_type: FinanceAccountType;
  opening_balance_minor: number;
  currency: string;
};

export type FinanceCategory = {
  id: string;
  workspace_id: string;
  name: string;
  kind: FinanceKind;
  color: string;
};

export type FinanceTransaction = {
  id: string;
  workspace_id: string;
  account_id: string;
  category_id: string | null;
  kind: FinanceKind;
  amount_minor: number;
  currency: string;
  description: string;
  transaction_date: string;
  is_recurring: boolean;
  created_at: string;
};

export type FinanceBudget = {
  id: string;
  workspace_id: string;
  category_id: string;
  month_key: string;
  amount_minor: number;
  currency: string;
};

export type SavingsGoal = {
  id: string;
  workspace_id: string;
  name: string;
  target_amount_minor: number;
  current_amount_minor: number;
  currency: string;
  target_date: string | null;
};

export type FinanceDebt = {
  id: string;
  workspace_id: string;
  creditor: string;
  description: string | null;
  total_amount_minor: number;
  paid_amount_minor: number;
  currency: string;
  due_date: string | null;
  status: "active" | "paid";
  created_at: string;
};

export type FinanceData = {
  workspaceId: string | null;
  workspaceName: string;
  setupRequired: boolean;
  accounts: FinanceAccount[];
  categories: FinanceCategory[];
  transactions: FinanceTransaction[];
  budgets: FinanceBudget[];
  goals: SavingsGoal[];
  debts: FinanceDebt[];
};

export function formatMoney(amountMinor: number, currency = "IDR") {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "IDR" ? 0 : 2,
  }).format(amountMinor / (currency === "IDR" ? 1 : 100));
}

export function currentMonthKey(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function getFinanceSummary(data: FinanceData, monthKey = currentMonthKey()) {
  const monthlyTransactions = data.transactions.filter((item) =>
    item.transaction_date.startsWith(monthKey)
  );
  const income = monthlyTransactions
    .filter((item) => item.kind === "income")
    .reduce((total, item) => total + item.amount_minor, 0);
  const expense = monthlyTransactions
    .filter((item) => item.kind === "expense")
    .reduce((total, item) => total + item.amount_minor, 0);
  const openingBalance = data.accounts.reduce(
    (total, account) => total + account.opening_balance_minor,
    0
  );
  const allMovement = data.transactions.reduce(
    (total, item) => total + (item.kind === "income" ? item.amount_minor : -item.amount_minor),
    0
  );

  return {
    balance: openingBalance + allMovement,
    income,
    expense,
    cashflow: income - expense,
  };
}

export function getBudgetUsage(data: FinanceData, budget: FinanceBudget) {
  const spent = data.transactions
    .filter(
      (item) =>
        item.kind === "expense" &&
        item.category_id === budget.category_id &&
        item.transaction_date.startsWith(budget.month_key)
    )
    .reduce((total, item) => total + item.amount_minor, 0);

  return {
    spent,
    remaining: budget.amount_minor - spent,
    percentage: budget.amount_minor > 0 ? Math.min(100, (spent / budget.amount_minor) * 100) : 0,
  };
}

export function getAccountBalance(account: FinanceAccount, transactions: FinanceTransaction[]) {
  return transactions
    .filter((item) => item.account_id === account.id)
    .reduce(
      (balance, item) =>
        balance + (item.kind === "income" ? item.amount_minor : -item.amount_minor),
      account.opening_balance_minor
    );
}
