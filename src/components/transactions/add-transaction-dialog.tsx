"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createTransaction } from "@/lib/actions/transactions";
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "@/types";
import { Plus, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface AddTransactionDialogProps {
  defaultType?: "income" | "expense";
  trigger?: React.ReactNode;
  quickAmount?: number;
}

// Get today's date string in "yyyy-MM-dd" format without date-fns
// to avoid server/client mismatch.
function getTodayString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function AddTransactionDialog({
  defaultType = "income",
  trigger,
  quickAmount,
}: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<"income" | "expense">(defaultType);
  const [amount, setAmount] = useState(quickAmount?.toString() ?? "");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  // Use lazy initializer — getTodayString() only runs on the client
  const [date, setDate] = useState<string>(() => getTodayString());
  const [error, setError] = useState("");

  const categories =
    type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  function resetForm() {
    setAmount(quickAmount?.toString() ?? "");
    setCategory("");
    setNote("");
    setDate(getTodayString());
    setError("");
    setType(defaultType);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!category) {
      setError("Please select a category");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await createTransaction({
        type,
        amountILS: parseFloat(amount),
        category,
        note: note || undefined,
        date,
      });
      setOpen(false);
      resetForm();
    } catch (err) {
      setError("Failed to add transaction. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetForm();
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus className="w-4 h-4" />
            Add Transaction
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-sm mx-4">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>

        {/* Type Toggle */}
        <div className="flex rounded-xl bg-white/5 p-1 mb-2">
          <button
            type="button"
            onClick={() => {
              setType("income");
              setCategory("");
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              type === "income"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            Income
          </button>
          <button
            type="button"
            onClick={() => {
              setType("expense");
              setCategory("");
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              type === "expense"
                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <ArrowDownRight className="w-4 h-4" />
            Expense
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Amount (ILS ₪)"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            min="0.01"
            step="0.01"
          />

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger label="Category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                // category strings are unique within each list
                <SelectItem key={`cat-${type}-${cat}`} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            label="Note (optional)"
            type="text"
            placeholder="Add a note..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          {error && <p className="text-sm text-red-400">{error}</p>}

          <Button
            type="submit"
            className="w-full"
            variant={type === "income" ? "success" : "destructive"}
            loading={loading}
          >
            {type === "income" ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
            Add {type === "income" ? "Income" : "Expense"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
