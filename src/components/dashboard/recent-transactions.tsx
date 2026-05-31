"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, ArrowRight } from "lucide-react";
import type { Transaction } from "@/types";

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-cyan-400" />
            Recent Transactions
          </CardTitle>
          <Link
            href="/transactions"
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition-colors"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <ArrowRight className="w-10 h-10 text-slate-700 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">No transactions yet</p>
            <p className="text-slate-600 text-xs mt-1">
              Add your first income or expense
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.slice(0, 6).map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group"
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    t.type === "income"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {t.type === "income" ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {t.category}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {t.note || formatDate(t.date)}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p
                    className={`text-sm font-bold ${
                      t.type === "income" ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {t.type === "income" ? "+" : "-"}
                    {formatCurrency(t.amountILS)}
                  </p>
                  <p className="text-xs text-slate-600">
                    {formatDate(t.date)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
