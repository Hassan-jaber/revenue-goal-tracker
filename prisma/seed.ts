import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { startOfMonth, endOfMonth, subDays } from "date-fns";
import * as dotenv from "dotenv";

// Load .env.local for local dev
dotenv.config({ path: ".env.local" });

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const hashedPassword = await bcrypt.hash("demo1234", 12);
  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@example.com",
      password: hashedPassword,
    },
  });

  console.log("✅ Created user:", user.email);

  const now = new Date();

  // Clean up existing data for demo user
  await prisma.monthlyGoal.deleteMany({ where: { userId: user.id } });
  await prisma.transaction.deleteMany({ where: { userId: user.id } });
  await prisma.exchangeRate.deleteMany({});

  await prisma.monthlyGoal.create({
    data: {
      userId: user.id,
      targetILS: 5000,
      startDate: startOfMonth(now),
      endDate: endOfMonth(now),
    },
  });
  console.log("✅ Created monthly goal: ₪5,000");

  const transactions = [
    { type: "income"  as const, amountILS: 3500, category: "Salary",        note: "Monthly salary",        daysAgo: 1 },
    { type: "income"  as const, amountILS: 800,  category: "Freelance",     note: "Web project",           daysAgo: 5 },
    { type: "income"  as const, amountILS: 200,  category: "Bonus",         note: "Performance bonus",     daysAgo: 7 },
    { type: "expense" as const, amountILS: 450,  category: "Food",          note: "Groceries",             daysAgo: 2 },
    { type: "expense" as const, amountILS: 120,  category: "Transportation", note: "Bus pass",             daysAgo: 3 },
    { type: "expense" as const, amountILS: 200,  category: "Bills",         note: "Internet & electricity", daysAgo: 4 },
    { type: "expense" as const, amountILS: 150,  category: "Health",        note: "Pharmacy",              daysAgo: 6 },
    { type: "expense" as const, amountILS: 300,  category: "Shopping",      note: "Clothes",               daysAgo: 8 },
  ];

  for (const tx of transactions) {
    await prisma.transaction.create({
      data: {
        userId: user.id,
        type: tx.type,
        amountILS: tx.amountILS,
        category: tx.category,
        note: tx.note,
        date: subDays(now, tx.daysAgo),
      },
    });
  }
  console.log(`✅ Created ${transactions.length} sample transactions`);

  await prisma.exchangeRate.create({
    data: { eurRate: 0.2502, usdRate: 0.2701, jodRate: 0.1914 },
  });
  console.log("✅ Created exchange rates");

  console.log("\n🎉 Seed complete!");
  console.log("   Email:    demo@example.com");
  console.log("   Password: demo1234");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
