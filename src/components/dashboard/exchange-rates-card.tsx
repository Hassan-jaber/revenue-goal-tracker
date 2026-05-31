"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { refreshExchangeRates } from "@/lib/actions/exchange-rates";
import { RefreshCw, Globe } from "lucide-react";
import type { ExchangeRate, MonthlyGoal } from "@/types";

interface ExchangeRatesCardProps {
  rates: ExchangeRate | null;
  goal: MonthlyGoal | null;
}

export function ExchangeRatesCard({ rates, goal }: ExchangeRatesCardProps) {
  const [loading, setLoading] = useState(false);

  async function handleRefresh() {
    setLoading(true);
    try {
      await refreshExchangeRates();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const currencies = rates
    ? [
        { code: "EUR", symbol: "€", rate: rates.eurRate, flag: "🇪🇺" },
        { code: "USD", symbol: "$", rate: rates.usdRate, flag: "🇺🇸" },
        { code: "JOD", symbol: "JD", rate: rates.jodRate, flag: "🇯🇴" },
      ]
    : [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            Exchange Rates
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {rates ? (
          <div className="space-y-3">
            {currencies.map(({ code, symbol, rate, flag }) => (
              <div key={code} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{flag}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{code}</p>
                    <p className="text-xs text-slate-500">₪1 = {symbol}{rate.toFixed(4)}</p>
                  </div>
                </div>
                {goal && (
                  <div className="text-right">
                    <p className="text-sm font-bold text-cyan-400">
                      {symbol}{(goal.targetILS * rate).toFixed(0)}
                    </p>
                    <p className="text-xs text-slate-500">goal value</p>
                  </div>
                )}
              </div>
            ))}
            <p className="text-xs text-slate-600 text-center pt-1">
              Updated {formatDate(rates.updatedAt)}
            </p>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-slate-500 text-sm">No rates available</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={handleRefresh} loading={loading}>
              <RefreshCw className="w-4 h-4" />
              Fetch Rates
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
