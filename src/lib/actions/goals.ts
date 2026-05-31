"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { startOfMonth, endOfMonth } from "date-fns";

export async function createGoal(data: {
  targetILS: number;
  month?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const date = data.month ? new Date(data.month + "-01") : new Date();
  const startDate = startOfMonth(date);
  const endDate = endOfMonth(date);

  const goal = await prisma.monthlyGoal.create({
    data: {
      userId: session.user.id,
      targetILS: data.targetILS,
      startDate,
      endDate,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/settings");
  return goal;
}

export async function updateGoal(id: string, data: { targetILS: number }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const goal = await prisma.monthlyGoal.findUnique({ where: { id } });
  if (!goal || goal.userId !== session.user.id) throw new Error("Not found");

  const updated = await prisma.monthlyGoal.update({
    where: { id },
    data: { targetILS: data.targetILS },
  });

  revalidatePath("/dashboard");
  revalidatePath("/settings");
  return updated;
}

export async function deleteGoal(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const goal = await prisma.monthlyGoal.findUnique({ where: { id } });
  if (!goal || goal.userId !== session.user.id) throw new Error("Not found");

  await prisma.monthlyGoal.delete({ where: { id } });

  revalidatePath("/dashboard");
  revalidatePath("/settings");
}

export async function getCurrentGoal() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);

  return prisma.monthlyGoal.findFirst({
    where: {
      userId: session.user.id,
      startDate: { lte: end },
      endDate: { gte: start },
    },
    orderBy: { createdAt: "desc" },
  });
}
