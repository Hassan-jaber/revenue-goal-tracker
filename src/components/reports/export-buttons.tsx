"use client";

import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import type { Transaction, MonthlyReport, MonthlyGoal } from "@/types";
import { formatDate } from "@/lib/utils";

interface ExportButtonsProps {
  transactions: Transaction[];
  report: MonthlyReport | null;
  goal: MonthlyGoal | null;
  month: string;
}

export function ExportButtons({
  transactions,
  report,
  month,
}: ExportButtonsProps) {
  function exportCSV() {
    const headers = ["Date", "Type", "Category", "Amount (ILS)", "Note"];
    const rows = transactions.map((t) => [
      formatDate(t.date),
      t.type,
      t.category,
      t.amountILS.toFixed(2),
      t.note ?? "",
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions-${month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportPDF() {
    // Build a printable HTML page and trigger the print dialog
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + t.amountILS, 0);
    const totalExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + t.amountILS, 0);
    const net = totalIncome - totalExpenses;

    const rows = transactions
      .map(
        (t) => `
      <tr>
        <td>${formatDate(t.date)}</td>
        <td style="color:${t.type === "income" ? "#10b981" : "#ef4444"}">${t.type}</td>
        <td>${t.category}</td>
        <td style="font-weight:bold; color:${t.type === "income" ? "#10b981" : "#ef4444"}">
          ${t.type === "income" ? "+" : "-"}₪${t.amountILS.toFixed(2)}
        </td>
        <td>${t.note ?? "-"}</td>
      </tr>
    `
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Report ${month}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 40px; color: #1e293b; }
          h1 { font-size: 24px; margin-bottom: 4px; }
          .subtitle { color: #64748b; font-size: 14px; margin-bottom: 24px; }
          .summary { display: flex; gap: 24px; margin-bottom: 28px; }
          .stat { background: #f8fafc; border-radius: 12px; padding: 16px 24px; flex:1; }
          .stat-label { font-size: 11px; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em; }
          .stat-value { font-size: 22px; font-weight: 700; margin-top: 4px; }
          .income { color: #10b981; }
          .expense { color: #ef4444; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th { text-align: left; padding: 10px 12px; background: #f1f5f9; font-size: 11px; text-transform: uppercase; color: #64748b; }
          td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
          @media print { body { margin: 20px; } }
        </style>
      </head>
      <body>
        <h1>Revenue Goal Tracker</h1>
        <p class="subtitle">Monthly Report — ${month}</p>
        <div class="summary">
          <div class="stat"><div class="stat-label">Total Income</div><div class="stat-value income">₪${totalIncome.toFixed(2)}</div></div>
          <div class="stat"><div class="stat-label">Total Expenses</div><div class="stat-value expense">₪${totalExpenses.toFixed(2)}</div></div>
          <div class="stat"><div class="stat-label">Net Balance</div><div class="stat-value" style="color:${net >= 0 ? "#10b981" : "#ef4444"}">₪${net.toFixed(2)}</div></div>
        </div>
        <table>
          <thead><tr><th>Date</th><th>Type</th><th>Category</th><th>Amount</th><th>Note</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
      </html>
    `;

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      win.focus();
      setTimeout(() => win.print(), 500);
    }
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={exportCSV}>
        <Download className="w-4 h-4" />
        Export CSV
      </Button>
      <Button variant="outline" size="sm" onClick={exportPDF}>
        <FileText className="w-4 h-4" />
        Export PDF
      </Button>
    </div>
  );
}
