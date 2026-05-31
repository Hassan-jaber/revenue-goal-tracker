"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerUser } from "@/lib/actions/auth";
import { TrendingUp, User, Mail, Lock, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    const name = fd.get("name") as string;
    const email = fd.get("email") as string;
    const password = fd.get("password") as string;
    const confirm = fd.get("confirm") as string;

    // Client-side validation
    if (!name.trim()) {
      setError("Please enter your name.");
      setLoading(false);
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      await registerUser({ name, email, password });
      // registerUser redirects to /dashboard on success — this line is unreachable
    } catch (err: unknown) {
      // NextAuth's signIn() throws a NEXT_REDIRECT object (not an Error) on success.
      // We must re-throw it so Next.js can handle the redirect.
      if (
        err &&
        typeof err === "object" &&
        "digest" in err &&
        typeof (err as { digest: string }).digest === "string" &&
        (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
      ) {
        throw err;
      }
      // Any other error is a real failure we should display
      const msg =
        err instanceof Error ? err.message : "Registration failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/3 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-cyan-500/30 mx-auto mb-4">
            <TrendingUp className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Create account</h1>
          <p className="text-slate-500 text-sm">Start tracking your revenue today</p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Full Name"
              type="text"
              name="name"
              placeholder="John Doe"
              required
              autoComplete="name"
              icon={<User className="w-4 h-4" />}
            />
            <Input
              label="Email Address"
              type="email"
              name="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
              icon={<Mail className="w-4 h-4" />}
            />
            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="Min. 6 characters"
              required
              autoComplete="new-password"
              icon={<Lock className="w-4 h-4" />}
            />
            <Input
              label="Confirm Password"
              type="password"
              name="confirm"
              placeholder="Repeat password"
              required
              autoComplete="new-password"
              icon={<Lock className="w-4 h-4" />}
            />

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-500 text-sm">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
