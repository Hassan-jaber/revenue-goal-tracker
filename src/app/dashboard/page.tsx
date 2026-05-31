import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { StatsCard } from "@/components/dashboard/stats-card";
import { GoalCard } from "@/components/dashboard/goal-card";
import { ExchangeRatesCard } from "@/components/dashboard/exchange-rates-card";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { QuickAddButtons } from "@/components/dashboard/quick-add-buttons";
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog";
import { formatCurrency, getTimeProgress, getDaysRemaining } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Clock,
  Target,
  Calendar,
} from "lucide-react";
import { startOfMonth, endOfMonth } from "date-fns";
import type { Transaction, MonthlyGoal, ExchangeRate } from "@/types";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [rawTransactions, rawGoal, rawRates] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        date: { gte: monthStart, lte: monthEnd },
      },
      orderBy: { date: "desc" },
    }),
    prisma.monthlyGoal.findFirst({
      where: {
        userId: session.user.id,
        startDate: { lte: monthEnd },
        endDate: { gte: monthStart },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.exchangeRate.findFirst({ orderBy: { updatedAt: "desc" } }),
  ]);

  const transactions = rawTransactions as unknown as Transaction[];
  const goal = rawGoal as unknown as MonthlyGoal | null;
  const rates = rawRates as unknown as ExchangeRate | null;

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amountILS, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amountILS, 0);

  const balance = totalIncome - totalExpenses;
  const goalProgress = goal
    ? Math.min(100, Math.round((totalIncome / goal.targetILS) * 100))
    : 0;
  const timeProgress = getTimeProgress(now);
  const daysRemaining = getDaysRemaining(now);
  const remaining = goal ? Math.max(0, goal.targetILS - totalIncome) : 0;

  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const firstName = session.user.name?.split(" ")[0] ?? "there";

  const incomeCount = transactions.filter((t) => t.type === "income").length;
  const expenseCount = transactions.filter((t) => t.type === "expense").length;

  return (
    <div className="animate-fade-in">
      <Header
        title={`${greeting}, ${firstName} 👋`}
        subtitle="Here's your financial overview"
      />

      <div className="p-6 lg:p-8 space-y-6">
        {/* Top action bar */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">
            This Month
          </p>
          {/*
           * AddTransactionDialog without a custom trigger renders its own
           * <Button> internally — no prop-passing of JSX across the
           * server/client boundary, so no hydration issue here.
           */}
          <AddTransactionDialog />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatsCard
            title="Balance"
            value={formatCurrency(balance)}
            icon={Wallet}
            color={balance >= 0 ? "green" : "red"}
            className="col-span-2 xl:col-span-2"
          />
          <StatsCard
            title="Income"
            value={formatCurrency(totalIncome)}
            icon={TrendingUp}
            color="green"
            trendValue={`${incomeCount} txns`}
          />
          <StatsCard
            title="Expenses"
            value={formatCurrency(totalExpenses)}
            icon={TrendingDown}
            color="red"
            trendValue={`${expenseCount} txns`}
          />
          <StatsCard
            title="Goal Progress"
            value={`${goalProgress}%`}
            icon={Target}
            color="blue"
            subtitle={goal ? `of ${formatCurrency(goal.targetILS)}` : "No goal set"}
          />
          <StatsCard
            title="Time Progress"
            value={`${timeProgress}%`}
            icon={Clock}
            trendValue={`${daysRemaining}d left`}
            subtitle="of this month"
          />
        </div>

        {/*
         * QuickAddButtons is a "use client" component.
         * It owns the <button> → DialogTrigger relationship entirely on the
         * client side, so Radix's aria-* injection never causes a server/client
         * HTML mismatch.
         */}
        <QuickAddButtons />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-4">
            {goal && (
              <div className="grid grid-cols-2 gap-4">
                <StatsCard
                  title="Remaining"
                  value={formatCurrency(remaining)}
                  icon={Target}
                  color="blue"
                  subtitle="to reach goal"
                />
                <StatsCard
                  title="Days Remaining"
                  value={`${daysRemaining}`}
                  icon={Calendar}
                  subtitle="in this month"
                />
              </div>
            )}
            <RecentTransactions transactions={transactions} />
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <GoalCard goal={goal} totalIncome={totalIncome} />
            <ExchangeRatesCard rates={rates} goal={goal} />
          </div>
        </div>
      </div>
    </div>
  );
}
