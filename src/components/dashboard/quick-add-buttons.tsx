"use client";

// This must be a Client Component.
// Reason: it renders <AddTransactionDialog> which uses Radix UI's DialogTrigger.
// DialogTrigger uses asChild to clone the <button> trigger and inject aria-*
// attributes (aria-haspopup, aria-expanded, aria-controls, data-state).
// If the parent (DashboardPage) is a Server Component and passes <button> JSX
// as a prop, the server renders the bare <button> but the client hydrates it
// with the extra Radix attributes — causing a hydration mismatch.
// By isolating this in a Client Component, the entire subtree is client-only
// and there is no SSR/CSR diff to reconcile.

import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog";

const QUICK_AMOUNTS = [5, 10, 20, 50, 100] as const;

export function QuickAddButtons() {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-slate-600 mr-1">Quick add:</span>
      {QUICK_AMOUNTS.map((amount) => (
        <AddTransactionDialog
          key={`quick-add-${amount}`}
          defaultType="income"
          quickAmount={amount}
          trigger={
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-all"
            >
              +₪{amount}
            </button>
          }
        />
      ))}
    </div>
  );
}
