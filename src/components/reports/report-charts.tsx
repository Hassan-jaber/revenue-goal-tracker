"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, PieChart as PieIcon, TrendingUp } from "lucide-react";
import type { Transaction, MonthlyReport } from "@/types";

const COLORS = [
  "#22d3ee",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

interface ReportChartsProps {
  transactions: Transaction[];
  reports: MonthlyReport[];
}

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900/95 backdrop-blur border border-white/10 rounded-xl p-3 shadow-xl">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      {payload.map((p) => (
        // Use name + value as key — guaranteed unique within a single tooltip
        <p
          key={`tooltip-${p.name}`}
          className="text-sm font-semibold"
          style={{ color: p.color }}
        >
          {p.name}: ₪{p.value?.toLocaleString("en-US")}
        </p>
      ))}
    </div>
  );
}

export function ReportCharts({ transactions, reports }: ReportChartsProps) {
  // Income vs Expenses bar data
  const incomeVsExpenses = [
    {
      name: "This Month",
      Income: transactions
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + t.amountILS, 0),
      Expenses: transactions
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + t.amountILS, 0),
    },
  ];

  // Category pie data — deduplicated by category name (category is unique)
  const expenseByCategory = transactions
    .filter((t) => t.type === "expense")
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] ?? 0) + t.amountILS;
      return acc;
    }, {});

  const pieData = Object.entries(expenseByCategory).map(([name, value]) => ({
    name,
    value: Math.round(value),
  }));

  // Monthly trend — reports are already unique per month from DB (userId_month unique index)
  // Reverse for chronological order, take last 6
  const trendData = [...reports]
    .reverse()
    .slice(-6)
    .map((r) => ({
      // r.month is "yyyy-MM" — safe unique key
      name: r.month,
      Income: r.totalIncome,
      Expenses: r.totalExpenses,
      Net: r.netBalance,
    }));

  const axisStyle = { fill: "#64748b", fontSize: 11 };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Income vs Expenses Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            Income vs Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={incomeVsExpenses} barGap={8}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
              />
              <XAxis
                dataKey="name"
                tick={axisStyle}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Income" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Expenses" fill="#ef4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Expenses by Category Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-cyan-400" />
            Expenses by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    // Use category name as key — categories are unique in pieData
                    <Cell
                      key={`pie-cell-${entry.name}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [
                    `₪${Number(value).toLocaleString("en-US")}`,
                    "Amount",
                  ]}
                  contentStyle={{
                    background: "rgba(15,23,42,0.95)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                  }}
                  labelStyle={{ color: "#94a3b8" }}
                />
                <Legend
                  formatter={(value) => (
                    <span style={{ color: "#94a3b8", fontSize: 11 }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-slate-500 text-sm">
              No expense data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Trend Area Chart */}
      {trendData.length > 0 && (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Monthly Trend (Last 6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="chart-income-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="chart-exp-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis
                  dataKey="name"
                  tick={axisStyle}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(v) => (
                    <span style={{ color: "#94a3b8", fontSize: 11 }}>{v}</span>
                  )}
                />
                <Area
                  type="monotone"
                  dataKey="Income"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#chart-income-grad)"
                  dot={{ fill: "#10b981", r: 4 }}
                />
                <Area
                  type="monotone"
                  dataKey="Expenses"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fill="url(#chart-exp-grad)"
                  dot={{ fill: "#ef4444", r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
