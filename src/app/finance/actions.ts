"use server";

import { revalidatePath } from "next/cache";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import {
  FINANCE_ACCOUNT_TYPES,
  FINANCE_KINDS,
  type FinanceAccountType,
  type FinanceKind,
} from "@/lib/finance";

export type FinanceActionResult = { success: true } | { error: string };
type FinanceContext =
  | {
      supabase: Awaited<ReturnType<typeof createClient>>;
      user: User;
      workspaceId: string;
    }
  | { error: string };

function refreshFinance() {
  revalidatePath("/");
  revalidatePath("/finance");
  revalidatePath("/money");
  revalidatePath("/goals");
}

function parsePositiveAmount(raw: FormDataEntryValue | null) {
  const digits = String(raw ?? "").replace(/[^0-9]/g, "");
  const amount = Number(digits);
  return Number.isSafeInteger(amount) && amount > 0 ? amount : null;
}

function pickKind(value: FormDataEntryValue | null): FinanceKind {
  const kind = String(value ?? "expense");
  return FINANCE_KINDS.includes(kind as FinanceKind) ? (kind as FinanceKind) : "expense";
}

async function requireFinanceContext(): Promise<FinanceContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sesi login tidak ditemukan." };
  }

  const { data: workspaceId, error } = await supabase.rpc("ensure_personal_workspace");

  if (error || typeof workspaceId !== "string") {
    return {
      error: "Modul keuangan belum aktif. Jalankan migration Supabase terbaru terlebih dahulu.",
    };
  }

  return { supabase, user, workspaceId };
}

export async function createFinanceAccountAction(
  formData: FormData
): Promise<FinanceActionResult> {
  const context = await requireFinanceContext();
  if (!("supabase" in context)) return { error: context.error };

  const name = String(formData.get("name") ?? "").trim();
  const rawType = String(formData.get("account_type") ?? "cash");
  const accountType = FINANCE_ACCOUNT_TYPES.includes(rawType as FinanceAccountType)
    ? (rawType as FinanceAccountType)
    : "cash";
  const openingBalance = parsePositiveAmount(formData.get("opening_balance")) ?? 0;

  if (!name) return { error: "Nama rekening wajib diisi." };

  const { error } = await context.supabase.from("finance_accounts").insert({
    workspace_id: context.workspaceId,
    name,
    account_type: accountType,
    opening_balance_minor: openingBalance,
    currency: "IDR",
    created_by: context.user.id,
  });

  if (error) return { error: error.message };
  refreshFinance();
  return { success: true };
}

export async function createFinanceCategoryAction(
  formData: FormData
): Promise<FinanceActionResult> {
  const context = await requireFinanceContext();
  if (!("supabase" in context)) return { error: context.error };

  const name = String(formData.get("name") ?? "").trim();
  const kind = pickKind(formData.get("kind"));
  const color = String(formData.get("color") ?? "#8b5cf6");

  if (!name) return { error: "Nama kategori wajib diisi." };

  const { error } = await context.supabase.from("finance_categories").insert({
    workspace_id: context.workspaceId,
    name,
    kind,
    color: /^#[0-9a-f]{6}$/i.test(color) ? color : "#8b5cf6",
    created_by: context.user.id,
  });

  if (error) return { error: error.message };
  refreshFinance();
  return { success: true };
}

export async function createFinanceTransactionAction(
  formData: FormData
): Promise<FinanceActionResult> {
  const context = await requireFinanceContext();
  if (!("supabase" in context)) return { error: context.error };

  const accountId = String(formData.get("account_id") ?? "").trim();
  const categoryId = String(formData.get("category_id") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const transactionDate = String(formData.get("transaction_date") ?? "").trim();
  const kind = pickKind(formData.get("kind"));
  const amount = parsePositiveAmount(formData.get("amount"));

  if (!accountId || !description || !transactionDate || !amount) {
    return { error: "Rekening, nominal, tanggal, dan keterangan wajib diisi." };
  }

  const [accountQuery, categoryQuery] = await Promise.all([
    context.supabase
      .from("finance_accounts")
      .select("id")
      .eq("id", accountId)
      .eq("workspace_id", context.workspaceId)
      .maybeSingle(),
    categoryId
      ? context.supabase
          .from("finance_categories")
          .select("id, kind")
          .eq("id", categoryId)
          .eq("workspace_id", context.workspaceId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (accountQuery.error || !accountQuery.data) return { error: "Rekening tidak valid." };
  if (categoryId && (categoryQuery.error || !categoryQuery.data)) {
    return { error: "Kategori tidak valid." };
  }
  if (categoryQuery.data && categoryQuery.data.kind !== kind) {
    return { error: "Kategori tidak sesuai dengan jenis transaksi." };
  }

  const { error } = await context.supabase.from("finance_transactions").insert({
    workspace_id: context.workspaceId,
    account_id: accountId,
    category_id: categoryId || null,
    kind,
    amount_minor: amount,
    currency: "IDR",
    description,
    transaction_date: transactionDate,
    is_recurring: formData.get("is_recurring") === "on",
    created_by: context.user.id,
  });

  if (error) return { error: error.message };
  refreshFinance();
  return { success: true };
}

export async function upsertFinanceBudgetAction(
  formData: FormData
): Promise<FinanceActionResult> {
  const context = await requireFinanceContext();
  if (!("supabase" in context)) return { error: context.error };

  const categoryId = String(formData.get("category_id") ?? "").trim();
  const monthKey = String(formData.get("month_key") ?? "").trim();
  const amount = parsePositiveAmount(formData.get("amount"));

  if (!categoryId || !/^\d{4}-\d{2}$/.test(monthKey) || !amount) {
    return { error: "Kategori, bulan, dan nominal anggaran wajib diisi." };
  }

  const { data: category } = await context.supabase
    .from("finance_categories")
    .select("id, kind")
    .eq("id", categoryId)
    .eq("workspace_id", context.workspaceId)
    .eq("kind", "expense")
    .maybeSingle();

  if (!category) return { error: "Kategori pengeluaran tidak valid." };

  const { error } = await context.supabase.from("finance_budgets").upsert(
    {
      workspace_id: context.workspaceId,
      category_id: categoryId,
      month_key: monthKey,
      amount_minor: amount,
      currency: "IDR",
      created_by: context.user.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "workspace_id,category_id,month_key" }
  );

  if (error) return { error: error.message };
  refreshFinance();
  return { success: true };
}

export async function createSavingsGoalAction(
  formData: FormData
): Promise<FinanceActionResult> {
  const context = await requireFinanceContext();
  if (!("supabase" in context)) return { error: context.error };

  const name = String(formData.get("name") ?? "").trim();
  const targetAmount = parsePositiveAmount(formData.get("target_amount"));
  const currentAmount = parsePositiveAmount(formData.get("current_amount")) ?? 0;
  const targetDate = String(formData.get("target_date") ?? "").trim() || null;

  if (!name || !targetAmount) return { error: "Nama dan target tabungan wajib diisi." };

  const { error } = await context.supabase.from("savings_goals").insert({
    workspace_id: context.workspaceId,
    name,
    target_amount_minor: targetAmount,
    current_amount_minor: currentAmount,
    currency: "IDR",
    target_date: targetDate,
    created_by: context.user.id,
  });

  if (error) return { error: error.message };
  refreshFinance();
  return { success: true };
}

export async function addSavingsContributionAction(
  goalId: string,
  formData: FormData
): Promise<FinanceActionResult> {
  const context = await requireFinanceContext();
  if (!("supabase" in context)) return { error: context.error };

  const amount = parsePositiveAmount(formData.get("amount"));
  if (!amount) return { error: "Nominal tambahan wajib lebih dari nol." };

  const { data: goal, error: readError } = await context.supabase
    .from("savings_goals")
    .select("current_amount_minor")
    .eq("id", goalId)
    .eq("workspace_id", context.workspaceId)
    .maybeSingle();

  if (readError || !goal) return { error: "Target tabungan tidak ditemukan." };

  const { error } = await context.supabase
    .from("savings_goals")
    .update({
      current_amount_minor: Number(goal.current_amount_minor) + amount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", goalId)
    .eq("workspace_id", context.workspaceId);

  if (error) return { error: error.message };
  refreshFinance();
  return { success: true };
}

export async function deleteFinanceTransactionAction(id: string): Promise<FinanceActionResult> {
  const context = await requireFinanceContext();
  if (!("supabase" in context)) return { error: context.error };

  const { error } = await context.supabase
    .from("finance_transactions")
    .delete()
    .eq("id", id)
    .eq("workspace_id", context.workspaceId);

  if (error) return { error: error.message };
  refreshFinance();
  return { success: true };
}

export async function createDebtAction(formData: FormData): Promise<FinanceActionResult> {
  const context = await requireFinanceContext();
  if (!("supabase" in context)) return { error: context.error };

  const creditor = String(formData.get("creditor") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const totalAmount = parsePositiveAmount(formData.get("total_amount"));
  const dueDate = String(formData.get("due_date") ?? "").trim() || null;

  if (!creditor || !totalAmount) {
    return { error: "Nama pemberi hutang dan total hutang wajib diisi." };
  }

  const { error } = await context.supabase.from("finance_debts").insert({
    workspace_id: context.workspaceId,
    creditor,
    description,
    total_amount_minor: totalAmount,
    currency: "IDR",
    due_date: dueDate,
    created_by: context.user.id,
  });

  if (error) return { error: error.message };
  refreshFinance();
  return { success: true };
}

export async function payDebtAction(
  debtId: string,
  formData: FormData
): Promise<FinanceActionResult> {
  const context = await requireFinanceContext();
  if (!("supabase" in context)) return { error: context.error };

  const accountId = String(formData.get("account_id") ?? "").trim();
  const amount = parsePositiveAmount(formData.get("amount"));
  const paymentDate = String(formData.get("payment_date") ?? "").trim();

  if (!accountId || !amount || !paymentDate) {
    return { error: "Rekening, nominal, dan tanggal pembayaran wajib diisi." };
  }

  const { error } = await context.supabase.rpc("record_debt_payment", {
    target_debt_id: debtId,
    target_account_id: accountId,
    payment_amount_minor: amount,
    paid_on: paymentDate,
  });

  if (error) return { error: error.message };
  refreshFinance();
  return { success: true };
}
