"use client";

import { useState, useEffect, useCallback } from "react";
import { ClientHeader } from "@/components/layout/client-header";
import { StatsCard } from "@/components/dashboard/stats-card";
import { ReportCharts } from "@/components/reports/report-charts";
import { ExportButtons } from "@/components/reports/export-buttons";
import { formatCurrency, formatMonthYear } from "@/lib/utils";
import { generateMonthlyReport, getMonthlyReports } from "@/lib/actions/reports";
import { TrendingUp, TrendingDown, Wallet, Target } from "lucide-react";
import type { Transaction, MonthlyReport, MonthlyGoal } from "@/types";

// Generate month key "yyyy-MM" without date-fns to avoid any hydration drift
function getCurrentMonthKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

// Build last N month keys in "yyyy-MM" format
function buildMonthOptions(count = 12): string[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(1); // avoid month-skipping on days like 31
    d.setMonth(d.getMonth() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  });
}

export default function ReportsPage() {
  // Initialize with empty string to avoid server/client mismatch on first render
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [goal] = useState<MonthlyGoal | null>(null);
  const [monthOptions, setMonthOptions] = useState<string[]>([]);

  // Set month options and selected month on the CLIENT only — avoids hydration mismatch
  useEffect(() => {
    const options = buildMonthOptions(12);
    setMonthOptions(options);
    setSelectedMonth(getCurrentMonthKey());
  }, []);

  const loadReport = useCallback(async (month: string) => {
    if (!month) return;
    setLoading(true);
    try {
      const data = await generateMonthlyReport(month);
      setReport(data.report as unknown as MonthlyReport);
      setTransactions(data.transactions as unknown as Transaction[]);
    } catch (error) {
      console.error("Failed to load report:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAllReports = useCallback(async () => {
    try {
      const data = await getMonthlyReports(12);
      setReports(data as unknown as MonthlyReport[]);
    } catch (error) {
      console.error("Failed to load reports:", error);
    }
  }, []);

  useEffect(() => {
    if (!selectedMonth) return;
    loadReport(selectedMonth);
    loadAllReports();
  }, [selectedMonth, loadReport, loadAllReports]);

  const goalProgress =
    report && goal
      ? Math.min(100, Math.round((report.totalIncome / goal.targetILS) * 100))
      : 0;

  return (
    <div className="animate-fade-in">
      <ClientHeader title="Reports" subtitle="Monthly financial analysis"/>

      <div className="p-6 lg:p-8 space-y-6">
        {/* Month Selector + Export */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3">
            <label className="text-xs text-slate-500 uppercase tracking-wider">
              Month
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              {monthOptions.map((m) => (
                // Key uses index suffix to guarantee uniqueness even if months repeat
                <option key={`month-option-${m}`} value={m} className="bg-slate-900">
                  {formatMonthYear(new Date(`${m}-01`))}
                </option>
              ))}
            </select>
          </div>
          <ExportButtons
            transactions={transactions}
            report={report}
            goal={goal}
            month={selectedMonth}
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-cyan-500/30 border-t-cyan-500 animate-spin" />
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                title="Total Income"
                value={formatCurrency(report?.totalIncome ?? 0)}
                icon={TrendingUp}
                color="green"
              />
              <StatsCard
                title="Total Expenses"
                value={formatCurrency(report?.totalExpenses ?? 0)}
                icon={TrendingDown}
                color="red"
              />
              <StatsCard
                title="Net Balance"
                value={formatCurrency(report?.netBalance ?? 0)}
                icon={Wallet}
                color={(report?.netBalance ?? 0) >= 0 ? "green" : "red"}
              />
              <StatsCard
                title="Goal Achievement"
                value={`${goalProgress}%`}
                icon={Target}
                color="blue"
                subtitle={goal ? `of ${formatCurrency(goal.targetILS)}` : "No goal"}
              />
            </div>

            {/* Charts */}
            <ReportCharts transactions={transactions} reports={reports} />
          </>
        )}
      </div>
    </div>
  );
}
