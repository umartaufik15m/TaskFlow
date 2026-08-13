import type { Metadata } from "next";
import AppShell from "@/components/app-shell";
import DebtManager from "@/components/debt-manager";
import FinanceManager from "@/components/finance-manager";
import { getFinanceViewerData } from "@/lib/finance-server";

export const metadata: Metadata = { title: "Money" };

export default async function MoneyPage() {
  const { user, displayName, finance } = await getFinanceViewerData();
  return <AppShell user={user} displayName={displayName} pageKey="money" pageLabel="Know where it goes" pageTitle="Money" pageDescription="Rekening, transaksi, anggaran, dan hutang. Cuma angka yang perlu lo tahu." heroMode="compact"><div className="money-page-stack"><FinanceManager finance={finance} /><DebtManager finance={finance} /></div></AppShell>;
}
