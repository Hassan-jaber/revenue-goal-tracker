import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { startOfMonth, endOfMonth, differenceInDays } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as ILS (or other currency).
 * Uses "en-US" locale explicitly so the output is identical on server and client
 * — prevents hydration mismatches caused by locale differences.
 */
export function formatCurrency(amount: number, currency = "ILS"): string {
  const symbols: Record<string, string> = {
    ILS: "₪",
    EUR: "€",
    USD: "$",
    JOD: "JD",
  };
  const symbol = symbols[currency] || currency;
  return `${symbol}${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function getCurrentMonthRange() {
  const now = new Date();
  return {
    start: startOfMonth(now),
    end: endOfMonth(now),
  };
}

export function getMonthKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function getDaysInMonth(date: Date = new Date()): number {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  return differenceInDays(end, start) + 1;
}

export function getDaysRemaining(date: Date = new Date()): number {
  const end = endOfMonth(date);
  return Math.max(0, differenceInDays(end, date));
}

export function getTimeProgress(date: Date = new Date()): number {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  const total = differenceInDays(end, start) + 1;
  const elapsed = differenceInDays(date, start) + 1;
  return Math.min(100, Math.round((elapsed / total) * 100));
}

/**
 * Format a date as "MMM d, yyyy" using a fixed locale to avoid hydration mismatch.
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format a date as "MMMM yyyy" using a fixed locale.
 */
export function formatMonthYear(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}
