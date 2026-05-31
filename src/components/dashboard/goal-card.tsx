"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import { createGoal, updateGoal, deleteGoal } from "@/lib/actions/goals";
import { Target, Edit2, Trash2, Plus } from "lucide-react";
import type { MonthlyGoal } from "@/types";

interface GoalCardProps {
  goal: MonthlyGoal | null;
  totalIncome: number;
}

export function GoalCard({ goal, totalIncome }: GoalCardProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [target, setTarget] = useState(goal?.targetILS?.toString() ?? "");

  const progress = goal ? Math.min(100, (totalIncome / goal.targetILS) * 100) : 0;
  const remaining = goal ? Math.max(0, goal.targetILS - totalIncome) : 0;

  const progressVariant =
    progress >= 100 ? "success" : progress >= 50 ? "default" : progress >= 25 ? "warning" : "danger";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (goal) {
        await updateGoal(goal.id, { targetILS: parseFloat(target) });
      } else {
        await createGoal({ targetILS: parseFloat(target) });
      }
      setOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!goal) return;
    setLoading(true);
    try {
      await deleteGoal(goal.id);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card glow="blue">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan-400" />
            Monthly Goal
          </CardTitle>
          <div className="flex gap-2">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  {goal ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{goal ? "Edit Monthly Goal" : "Set Monthly Goal"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Target Amount (ILS ₪)"
                    type="number"
                    placeholder="e.g. 3000"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    required
                    min="1"
                  />
                  <Button type="submit" className="w-full" loading={loading}>
                    {goal ? "Update Goal" : "Set Goal"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            {goal && (
              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={handleDelete}>
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {goal ? (
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-3xl font-bold text-white">{Math.round(progress)}%</p>
                <p className="text-xs text-slate-500 mt-0.5">of {formatCurrency(goal.targetILS)} goal</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-cyan-400">{formatCurrency(totalIncome)}</p>
                <p className="text-xs text-slate-500">earned</p>
              </div>
            </div>
            <Progress value={progress} variant={progressVariant} className="h-3" />
            <div className="flex justify-between text-xs text-slate-500">
              <span className="text-emerald-400 font-medium">+{formatCurrency(totalIncome)}</span>
              <span className="text-red-400 font-medium">{formatCurrency(remaining)} remaining</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <Target className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">No goal set for this month</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => setOpen(true)}>
              <Plus className="w-4 h-4" />
              Set Goal
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
