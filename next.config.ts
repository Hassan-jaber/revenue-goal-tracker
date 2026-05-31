import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tell Next.js/Turbopack to treat these packages as server-only (Node.js).
  // Prevents them from being accidentally bundled into the Edge Runtime.
  serverExternalPackages: ["@prisma/client", "bcryptjs", "pg"],

  experimental: {
    serverActions: {
      // Extend allowed origins for local dev + Vercel preview URLs
      allowedOrigins: [
        "localhost:3000",
        "*.vercel.app",
      ],
    },
  },
};

export default nextConfig;
