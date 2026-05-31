"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signIn, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
}): Promise<{ success: true }> {
  // 1. Check for existing user
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existing) {
    throw new Error("An account with this email already exists.");
  }

  // 2. Hash password
  const hashedPassword = await bcrypt.hash(data.password, 12);

  // 3. Create user
  await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
    },
  });

  // 4. Sign them in immediately after registration.
  //    signIn() from NextAuth v5 throws a NEXT_REDIRECT when redirectTo is set
  //    — this is expected and must NOT be caught.
  await signIn("credentials", {
    email: data.email,
    password: data.password,
    redirectTo: "/dashboard",
  });

  // This line is unreachable (signIn redirects), but satisfies TypeScript
  return { success: true };
}

export async function loginUser(data: {
  email: string;
  password: string;
}): Promise<void> {
  // signIn() throws NEXT_REDIRECT on success — must NOT be caught by the caller.
  // On credential failure it throws an AuthError — the caller should catch that.
  await signIn("credentials", {
    email: data.email,
    password: data.password,
    redirectTo: "/dashboard",
  });
}

export async function logoutUser(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}
