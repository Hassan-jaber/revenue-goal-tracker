import { handlers } from "@/lib/auth";

// Force Node.js runtime — Prisma cannot run in Edge Runtime
export const runtime = "nodejs";

export const { GET, POST } = handlers;
