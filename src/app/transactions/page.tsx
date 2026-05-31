import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { TransactionList } from "@/components/transactions/transaction-list";
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, ArrowLeftRight } from "lucide-react";
import type { Transaction } from "@/types";

export default async function TransactionsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const rawTransactions = await prisma.transaction.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
  });

  const transactions = rawTransactions as unknown as Transaction[];

  const totalIncome = transactions
    .filter((t: Transaction) => t.type === "income")
    .reduce((sum: number, t: Transaction) => sum + t.amountILS, 0);

  const totalExpenses = transactions
    .filter((t: Transaction) => t.type === "expense")
    .reduce((sum: number, t: Transaction) => sum + t.amountILS, 0);

  return (
    <div className="animate-fade-in">
      <Header title="Transactions" subtitle="All your income and expenses" />

      <div className="p-6 lg:p-8 space-y-6">
        {/* Summary bar */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl bg-white/5 border border-white/8 p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Income</p>
              <p className="text-base font-bold text-emerald-400">{formatCurrency(totalIncome)}</p>
            </div>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/8 p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Expenses</p>
              <p className="text-base font-bold text-red-400">{formatCurrency(totalExpenses)}</p>
            </div>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/8 p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Total</p>
              <p className="text-base font-bold text-white">{transactions.length}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <p className="text-sm text-slate-500">{transactions.length} transactions</p>
          <AddTransactionDialog />
        </div>

        <TransactionList transactions={transactions} />
      </div>
    </div>
  );
}
