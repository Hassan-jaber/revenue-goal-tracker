import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Next.js 16 renamed "middleware.ts" → "proxy.ts".
 * This file replaces src/middleware.ts.
 *
 * Edge-compatible: uses JWT only — zero Node.js / Prisma imports.
 * Prisma runs only in Server Actions and API routes (Node.js runtime).
 */

const PUBLIC_PATHS = new Set(["/login", "/register"]);

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow NextAuth internal API routes
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Allow static assets
  if (pathname.startsWith("/_next") || pathname === "/favicon.ico") {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isPublic = PUBLIC_PATHS.has(pathname);

  if (!token && !isPublic) {
    // Not authenticated → redirect to login, preserve intended destination
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (token && isPublic) {
    // Already authenticated → send to dashboard
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     * - _next/static
     * - _next/image
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
