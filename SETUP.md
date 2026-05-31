# Setup Guide — Revenue Goal Tracker

## Prerequisites
- Node.js 18+
- PostgreSQL 14+ running locally (or use Neon/Supabase/Railway for cloud)
- npm

---

## Step 1 — Install dependencies

```bash
npm install
```

---

## Step 2 — Create `.env.local`

```env
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/revenue_tracker"
NEXTAUTH_SECRET="run-openssl-rand-base64-32-to-generate"
NEXTAUTH_URL="http://localhost:3000"
```

Generate a secret:
```bash
openssl rand -base64 32
```

---

## Step 3 — Create the database (PostgreSQL)

```sql
-- In psql or pgAdmin:
CREATE DATABASE revenue_tracker;
```

---

## Step 4 — Generate Prisma client & push schema

```bash
# Generate the Prisma client
npx prisma generate

# Push the schema to your database (creates all tables)
npx prisma db push
```

---

## Step 5 — Seed demo data (optional)

```bash
npm run db:seed
```

Demo login:
- **Email:** demo@example.com
- **Password:** demo1234

---

## Step 6 — Run the dev server

```bash
npm run dev
```

Open http://localhost:3000

---

## Prisma 7 Notes

This project uses **Prisma 7.x** which introduces `prisma.config.ts` for configuration.

- `prisma.config.ts` — CLI config (schema path, datasource URL, seed command)
- `prisma/schema.prisma` — data model definitions
- The `url` field stays in `schema.prisma` (required for `prisma generate`)

### Common commands

```bash
npx prisma generate        # Re-generate client after schema changes
npx prisma db push         # Push schema to DB (dev, no migration files)
npx prisma migrate dev     # Create & apply a migration (production-ready)
npx prisma migrate deploy  # Apply pending migrations (CI/production)
npx prisma studio          # Open visual DB browser
npm run db:seed            # Seed demo data
```

---

## Deploying to Vercel

1. Push to GitHub
2. Import on vercel.com/new
3. Set environment variables:
   - `DATABASE_URL` — your production Postgres URL
   - `NEXTAUTH_SECRET` — 32+ char random string
   - `NEXTAUTH_URL` — your deployment URL (e.g. https://myapp.vercel.app)
4. Change the build command to:
   ```
   npx prisma generate && npx prisma migrate deploy && next build
   ```

**Recommended free DB providers:** Neon, Supabase, Railway, Vercel Postgres

---

## Troubleshooting

### `Module not found: Can't resolve '.prisma/client/default'`
Run `npx prisma generate` — the client hasn't been generated yet.

### `Error: Prisma schema validation — url is no longer supported`
Make sure you have `prisma.config.ts` in the project root (already included).
The `url` in `schema.prisma` is still required for `prisma generate`.

### `No seed command configured`
Run `npm run db:seed` instead of `npx prisma db seed`.
Or set `DATABASE_URL` in `.env.local` and run `tsx prisma/seed.ts`.

### Middleware error about Prisma/Edge Runtime
This is fixed — `src/middleware.ts` uses `getToken` (JWT only, no Prisma).
Prisma runs only in Node.js server actions and API routes.
