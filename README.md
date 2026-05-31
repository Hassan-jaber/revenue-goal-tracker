# 💰 Revenue Goal Tracker

A production-ready personal finance SaaS built with **Next.js 15**, **TypeScript**, **PostgreSQL**, **Prisma**, and **NextAuth**. Track income, expenses, and monthly goals with a premium fintech UI inspired by Revolut and Wise.

---

## ✨ Features

- 🔐 **Email/Password Auth** — NextAuth v5 JWT sessions
- 🎯 **Monthly Goal Tracking** — Set/edit/delete targets with progress bars
- 💳 **Transaction Management** — Add/edit/delete income & expense with search & filters
- 📊 **Reports & Charts** — Bar, pie, and area trend charts via Recharts
- 💱 **Live Exchange Rates** — ILS → EUR, USD, JOD with auto-refresh
- 📤 **Export** — PDF (print) and CSV download
- 🌙 **Dark Mode** — Deep navy glassmorphism design
- 📱 **Fully Responsive** — Mobile bottom nav + desktop sidebar

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create `.env.local`:
```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/revenue_tracker"
NEXTAUTH_SECRET="your-32-char-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```
Generate a secret: `openssl rand -base64 32`

### 3. Set Up Database
```bash
# Push schema (development)
npx prisma db push

# Or run migration
npx prisma migrate dev --name init
```

### 4. Seed Demo Data (optional)
```bash
npm install -D ts-node
npx prisma db seed
# Login: demo@example.com / demo1234
```

### 5. Run
```bash
npm run dev
```
Open http://localhost:3000

---

## 🗄 Database Schema

| Table | Key Fields |
|---|---|
| `User` | id, name, email, password |
| `MonthlyGoal` | userId, targetILS, startDate, endDate |
| `Transaction` | userId, type, amountILS, category, note, date |
| `ExchangeRate` | eurRate, usdRate, jodRate |
| `MonthlyReport` | userId, month, totalIncome, totalExpenses, netBalance |

---

## ☁️ Deploy to Vercel

1. Push to GitHub
2. Import on [vercel.com/new](https://vercel.com/new)
3. Add env vars: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
4. Run migrations: add `"build": "prisma migrate deploy && next build"` to package.json

**Recommended DB providers:** Vercel Postgres, Neon, Supabase, Railway

---

## 🛠 Commands

```bash
npm run dev              # Dev server
npm run build            # Production build
npx prisma studio        # Visual DB browser
npx prisma db push       # Push schema changes
npx prisma migrate dev   # Create migration
npx prisma migrate deploy # Apply migrations (prod)
```

---

## 🔧 Tech Stack

Next.js 15 · TypeScript · Tailwind CSS · PostgreSQL · Prisma · NextAuth v5 · Recharts · Radix UI · Lucide React

---

## 🔒 Security

- bcryptjs password hashing (12 rounds)
- JWT sessions via NextAuth
- All server actions require authenticated session
- All DB queries scoped to `userId`
- Route middleware protection
