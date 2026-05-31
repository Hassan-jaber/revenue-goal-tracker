"use client";

import { useState } from "react";
import { ClientHeader } from "@/components/layout/client-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog";
import { createGoal } from "@/lib/actions/goals";
import { refreshExchangeRates } from "@/lib/actions/exchange-rates";
import { logoutUser } from "@/lib/actions/auth";
import { Target, RefreshCw, Zap, LogOut, Bell, Shield } from "lucide-react";

const QUICK_AMOUNTS = [5, 10, 20, 50, 100, 200] as const;

export default function SettingsPage() {
  const [goalTarget, setGoalTarget] = useState("");
  const [goalLoading, setGoalLoading] = useState(false);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [goalSuccess, setGoalSuccess] = useState(false);

  async function handleSetGoal(e: React.FormEvent) {
    e.preventDefault();
    setGoalLoading(true);
    try {
      await createGoal({ targetILS: parseFloat(goalTarget) });
      setGoalSuccess(true);
      setGoalTarget("");
      setTimeout(() => setGoalSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setGoalLoading(false);
    }
  }

  async function handleRefreshRates() {
    setRatesLoading(true);
    try {
      await refreshExchangeRates();
    } finally {
      setRatesLoading(false);
    }
  }

  return (
    <div className="animate-fade-in">
      <ClientHeader title="Settings" subtitle="Manage your preferences" />

      <div className="p-6 lg:p-8 space-y-6 max-w-2xl">
        {/* Monthly Goal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan-400" />
              Monthly Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSetGoal} className="flex gap-3">
              <Input
                type="number"
                placeholder="Enter target amount in ILS"
                value={goalTarget}
                onChange={(e) => setGoalTarget(e.target.value)}
                required
                min="1"
              />
              <Button type="submit" loading={goalLoading} className="flex-shrink-0">
                Set Goal
              </Button>
            </form>
            {goalSuccess && (
              <p className="text-emerald-400 text-sm mt-2">
                ✓ Goal updated for this month
              </p>
            )}
            <p className="text-xs text-slate-500 mt-3">
              This will set or override the monthly income target for the current month.
            </p>
          </CardContent>
        </Card>

        {/* Quick Add Buttons */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              Quick Add Buttons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500 mb-4">
              Tap any button to quickly add income with preset amounts
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_AMOUNTS.map((amount) => (
                // Namespaced key: settings-quick-{amount}
                <AddTransactionDialog
                  key={`settings-quick-${amount}`}
                  defaultType="income"
                  quickAmount={amount}
                  trigger={
                    <button className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/20 transition-all">
                      +₪{amount}
                    </button>
                  }
                />
              ))}
            </div>
            <p className="text-xs text-slate-600 mt-4">
              Clicking any button will open the add transaction dialog pre-filled with that amount.
            </p>
          </CardContent>
        </Card>

        {/* Exchange Rates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-cyan-400" />
              Exchange Rates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-500 mb-4">
              Rates are fetched automatically daily. You can also refresh manually.
            </p>
            <Button
              variant="outline"
              onClick={handleRefreshRates}
              loading={ratesLoading}
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Exchange Rates
            </Button>
          </CardContent>
        </Card>

        {/* Account */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-white">Notifications</p>
                  <p className="text-xs text-slate-500">Goal progress alerts</p>
                </div>
              </div>
              <span className="text-xs text-slate-600 bg-slate-800 px-2 py-1 rounded-lg">
                Coming soon
              </span>
            </div>

            <form action={logoutUser}>
              <button
                type="submit"
                className="flex items-center gap-3 w-full p-3 rounded-xl bg-red-500/5 border border-red-500/10 text-red-400 hover:bg-red-500/10 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <div className="text-left">
                  <p className="text-sm font-medium">Sign Out</p>
                  <p className="text-xs text-red-500/70">End your session</p>
                </div>
              </button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center py-4">
          <p className="text-xs text-slate-700">
            Revenue Goal Tracker v1.0.0 · Built with Next.js 16 + React 19
          </p>
        </div>
      </div>
    </div>
  );
}
