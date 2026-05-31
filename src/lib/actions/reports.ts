"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format, startOfMonth, endOfMonth } from "date-fns";

export async function generateMonthlyReport(month?: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const date = month ? new Date(month + "-01") : new Date();
  const monthKey = format(date, "yyyy-MM");
  const start = startOfMonth(date);
  const end = endOfMonth(date);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: session.user.id,
      date: { gte: start, lte: end },
    },
  });

  const totalIncome = transactions
    .filter((t: { type: string; amountILS: number }) => t.type === "income")
    .reduce((sum: number, t: { type: string; amountILS: number }) => sum + t.amountILS, 0);

  const totalExpenses = transactions
    .filter((t: { type: string; amountILS: number }) => t.type === "expense")
    .reduce((sum: number, t: { type: string; amountILS: number }) => sum + t.amountILS, 0);

  const netBalance = totalIncome - totalExpenses;

  const report = await prisma.monthlyReport.upsert({
    where: {
      userId_month: {
        userId: session.user.id,
        month: monthKey,
      },
    },
    update: { totalIncome, totalExpenses, netBalance },
    create: {
      userId: session.user.id,
      month: monthKey,
      totalIncome,
      totalExpenses,
      netBalance,
    },
  });

  return { report, transactions };
}

export async function getMonthlyReports(months = 6) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return prisma.monthlyReport.findMany({
    where: { userId: session.user.id },
    orderBy: { month: "desc" },
    take: months,
  });
}

export async function getReportWithTransactions(month: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const date = new Date(month + "-01");
  const start = startOfMonth(date);
  const end = endOfMonth(date);

  const [report, transactions, goal] = await Promise.all([
    prisma.monthlyReport.findUnique({
      where: {
        userId_month: { userId: session.user.id, month },
      },
    }),
    prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        date: { gte: start, lte: end },
      },
      orderBy: { date: "desc" },
    }),
    prisma.monthlyGoal.findFirst({
      where: {
        userId: session.user.id,
        startDate: { lte: end },
        endDate: { gte: start },
      },
    }),
  ]);

  return { report, transactions, goal };
}
