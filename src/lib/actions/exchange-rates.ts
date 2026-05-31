"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getExchangeRates() {
  const rates = await prisma.exchangeRate.findFirst({
    orderBy: { updatedAt: "desc" },
  });
  return rates;
}

export async function refreshExchangeRates() {
  try {
    // Try fetching from public API (no key required for basic rates)
    const response = await fetch(
      "https://api.exchangerate-api.com/v4/latest/ILS",
      { next: { revalidate: 3600 } }
    );

    if (response.ok) {
      const data = await response.json();
      const rates = await prisma.exchangeRate.create({
        data: {
          eurRate: data.rates?.EUR ?? 0.25,
          usdRate: data.rates?.USD ?? 0.27,
          jodRate: data.rates?.JOD ?? 0.19,
        },
      });
      revalidatePath("/dashboard");
      return rates;
    }
  } catch (error) {
    console.error("Failed to fetch exchange rates:", error);
  }

  // Fallback rates if API fails
  const fallback = await prisma.exchangeRate.create({
    data: {
      eurRate: 0.25,
      usdRate: 0.27,
      jodRate: 0.19,
    },
  });

  revalidatePath("/dashboard");
  return fallback;
}
