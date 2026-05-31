"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { TransactionType } from "@/types";

export async function createTransaction(data: {
  type: TransactionType;
  amountILS: number;
  category: string;
  note?: string;
  date: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const transaction = await prisma.transaction.create({
    data: {
      userId: session.user.id,
      type: data.type,
      amountILS: data.amountILS,
      category: data.category,
      note: data.note,
      date: new Date(data.date),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  return transaction;
}

export async function updateTransaction(
  id: string,
  data: {
    type?: TransactionType;
    amountILS?: number;
    category?: string;
    note?: string;
    date?: string;
  }
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const transaction = await prisma.transaction.findUnique({ where: { id } });
  if (!transaction || transaction.userId !== session.user.id)
    throw new Error("Not found");

  const updated = await prisma.transaction.update({
    where: { id },
    data: {
      ...data,
      date: data.date ? new Date(data.date) : undefined,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  return updated;
}

export async function deleteTransaction(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const transaction = await prisma.transaction.findUnique({ where: { id } });
  if (!transaction || transaction.userId !== session.user.id)
    throw new Error("Not found");

  await prisma.transaction.delete({ where: { id } });

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
}

export async function getTransactions(filters?: {
  type?: TransactionType;
  category?: string;
  month?: string;
  search?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const where: Record<string, unknown> = { userId: session.user.id };

  if (filters?.type) where.type = filters.type;
  if (filters?.category) where.category = filters.category;
  if (filters?.month) {
    const [year, month] = filters.month.split("-").map(Number);
    where.date = {
      gte: new Date(year, month - 1, 1),
      lt: new Date(year, month, 1),
    };
  }
  if (filters?.search) {
    where.OR = [
      { note: { contains: filters.search, mode: "insensitive" } },
      { category: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return prisma.transaction.findMany({
    where,
    orderBy: { date: "desc" },
  });
}

export async function getCurrentMonthTransactions() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  return prisma.transaction.findMany({
    where: {
      userId: session.user.id,
      date: { gte: start, lte: end },
    },
    orderBy: { date: "desc" },
  });
}
