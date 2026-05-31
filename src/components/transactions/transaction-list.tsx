"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import { deleteTransaction, updateTransaction } from "@/lib/actions/transactions";
import {
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Edit2,
  Trash2,
  Filter,
} from "lucide-react";
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "@/types";
import type { Transaction } from "@/types";

interface TransactionListProps {
  transactions: Transaction[];
}

// Format a date object to "yyyy-MM-dd" without date-fns
function toInputDateString(date: Date | string): string {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function TransactionList({ transactions }: TransactionListProps) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(false);

  // Edit form state
  const [editAmount, setEditAmount] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editDate, setEditDate] = useState("");

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (filterType !== "all" && t.type !== filterType) return false;
      if (filterCategory !== "all" && t.category !== filterCategory) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          t.category.toLowerCase().includes(q) ||
          (t.note?.toLowerCase().includes(q) ?? false)
        );
      }
      return true;
    });
  }, [transactions, filterType, filterCategory, search]);

  // Unique categories from all transactions
  const allCategories = useMemo(
    () => Array.from(new Set(transactions.map((t) => t.category))),
    [transactions]
  );

  function openEdit(tx: Transaction) {
    setEditingTx(tx);
    setEditAmount(tx.amountILS.toString());
    setEditCategory(tx.category);
    setEditNote(tx.note ?? "");
    setEditDate(toInputDateString(tx.date));
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingTx) return;
    setLoading(true);
    try {
      await updateTransaction(editingTx.id, {
        amountILS: parseFloat(editAmount),
        category: editCategory,
        note: editNote || undefined,
        date: editDate,
      });
      setEditingTx(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this transaction?")) return;
    await deleteTransaction(id);
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search transactions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="flex gap-2">
              <div className="flex rounded-xl bg-white/5 p-0.5 border border-white/10">
                {(["all", "income", "expense"] as const).map((t) => (
                  <button
                    key={`filter-type-${t}`}
                    onClick={() => setFilterType(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                      filterType === t
                        ? t === "income"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : t === "expense"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-white/10 text-white"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              {allCategories.length > 0 && (
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-36 h-9">
                    <Filter className="w-3 h-3 mr-1 text-slate-400" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {allCategories.map((c) => (
                      <SelectItem key={`filter-cat-${c}`} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Items */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <ArrowDownRight className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">No transactions found</p>
          <p className="text-slate-600 text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((t) => (
            // t.id is a CUID from Prisma — guaranteed globally unique
            <Card key={t.id} className="group hover:border-white/15 transition-all">
              <CardContent className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      t.type === "income"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {t.type === "income" ? (
                      <ArrowUpRight className="w-5 h-5" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-white">{t.category}</p>
                      <Badge variant={t.type === "income" ? "income" : "expense"}>
                        {t.type}
                      </Badge>
                    </div>
                    {t.note && (
                      <p className="text-xs text-slate-500 truncate mt-0.5">{t.note}</p>
                    )}
                    <p className="text-xs text-slate-600 mt-0.5">
                      {formatDate(t.date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <p
                      className={`text-base font-bold ${
                        t.type === "income" ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {t.type === "income" ? "+" : "-"}
                      {formatCurrency(t.amountILS)}
                    </p>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEdit(t)}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-400 hover:bg-red-500/10"
                        onClick={() => handleDelete(t.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingTx} onOpenChange={(v) => !v && setEditingTx(null)}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <Input
              label="Amount (ILS ₪)"
              type="number"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              required
              min="0.01"
              step="0.01"
            />
            <Select value={editCategory} onValueChange={setEditCategory}>
              <SelectTrigger label="Category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(editingTx?.type === "income"
                  ? INCOME_CATEGORIES
                  : EXPENSE_CATEGORIES
                ).map((cat) => (
                  <SelectItem key={`edit-cat-${editingTx?.type}-${cat}`} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              label="Note (optional)"
              type="text"
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)}
            />
            <Input
              label="Date"
              type="date"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              required
            />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setEditingTx(null)}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" loading={loading}>
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
