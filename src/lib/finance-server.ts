import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDisplayName } from "@/lib/taskflow";
import type {
  FinanceAccount,
  FinanceBudget,
  FinanceCategory,
  FinanceData,
  FinanceDebt,
  FinanceTransaction,
  SavingsGoal,
} from "@/lib/finance";

const EMPTY_FINANCE: FinanceData = {
  workspaceId: null,
  workspaceName: "Workspace Pribadi",
  setupRequired: true,
  accounts: [],
  categories: [],
  transactions: [],
  budgets: [],
  goals: [],
  debts: [],
};

export async function getFinanceViewerData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: workspaceId, error: workspaceError } = await supabase.rpc(
    "ensure_personal_workspace"
  );

  if (workspaceError || typeof workspaceId !== "string") {
    return {
      user,
      displayName: getDisplayName(user),
      finance: EMPTY_FINANCE,
    };
  }

  const [workspaceQuery, accountsQuery, categoriesQuery, transactionsQuery, budgetsQuery, goalsQuery, debtsQuery] =
    await Promise.all([
      supabase.from("workspaces").select("name").eq("id", workspaceId).single(),
      supabase.from("finance_accounts").select("*").eq("workspace_id", workspaceId).order("created_at"),
      supabase.from("finance_categories").select("*").eq("workspace_id", workspaceId).order("kind").order("name"),
      supabase.from("finance_transactions").select("*").eq("workspace_id", workspaceId).order("transaction_date", { ascending: false }).order("created_at", { ascending: false }).limit(100),
      supabase.from("finance_budgets").select("*").eq("workspace_id", workspaceId).order("month_key", { ascending: false }),
      supabase.from("savings_goals").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false }),
      supabase.from("finance_debts").select("*").eq("workspace_id", workspaceId).order("status").order("due_date", { ascending: true, nullsFirst: false }),
    ]);

  const queryError =
    accountsQuery.error ??
    categoriesQuery.error ??
    transactionsQuery.error ??
    budgetsQuery.error ??
    goalsQuery.error;
  const optionalDebts = debtsQuery.error ? [] : (debtsQuery.data ?? []);

  const finance: FinanceData = queryError
    ? EMPTY_FINANCE
    : {
        workspaceId,
        workspaceName: String(workspaceQuery.data?.name ?? "Workspace Pribadi"),
        setupRequired: false,
        accounts: (accountsQuery.data ?? []) as FinanceAccount[],
        categories: (categoriesQuery.data ?? []) as FinanceCategory[],
        transactions: (transactionsQuery.data ?? []) as FinanceTransaction[],
        budgets: (budgetsQuery.data ?? []) as FinanceBudget[],
        goals: (goalsQuery.data ?? []) as SavingsGoal[],
        debts: optionalDebts as FinanceDebt[],
      };

  return {
    user,
    displayName: getDisplayName(user),
    finance,
  };
}
