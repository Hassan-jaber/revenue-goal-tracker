export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amountILS: number;
  category: string;
  note?: string | null;
  date: Date | string;
  createdAt: Date | string;
}

export interface MonthlyGoal {
  id: string;
  userId: string;
  targetILS: number;
  startDate: Date | string;
  endDate: Date | string;
  createdAt: Date | string;
}

export interface ExchangeRate {
  id: string;
  eurRate: number;
  usdRate: number;
  jodRate: number;
  updatedAt: Date | string;
}

export interface MonthlyReport {
  id: string;
  userId: string;
  month: string;
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  createdAt: Date | string;
}

export interface DashboardStats {
  currentBalance: number;
  totalIncome: number;
  totalExpenses: number;
  goal: MonthlyGoal | null;
  goalProgress: number;
  timeProgress: number;
  remainingAmount: number;
  daysRemaining: number;
  recentTransactions: Transaction[];
  exchangeRates: ExchangeRate | null;
}

export const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Bonus",
  "Investment",
  "Other",
] as const;

export const EXPENSE_CATEGORIES = [
  "Food",
  "Transportation",
  "Shopping",
  "Bills",
  "Education",
  "Health",
  "Entertainment",
  "Other",
] as const;
