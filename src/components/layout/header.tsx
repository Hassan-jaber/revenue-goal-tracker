// Server Component — async, fetches session server-side
// Date is rendered server-side using a fixed locale to prevent hydration mismatch.

import { auth } from "@/lib/auth";
import { Bell } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

function formatServerDate(): string {
  // Use explicit locale and options so the string is identical on
  // server (Node.js) and client (browser) — avoids hydration mismatch.
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function Header({ title, subtitle }: HeaderProps) {
  const session = await auth();
  const initials =
    session?.user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "U";

  const dateStr = formatServerDate();

  return (
    <header className="flex items-center justify-between p-6 lg:px-8 border-b border-white/5">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        {/* suppressHydrationWarning is a last-resort escape hatch — here we avoid
            it entirely by using a fixed locale string generated on the server. */}
        <p className="text-xs text-slate-600 mt-0.5 hidden sm:block">{dateStr}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          className="relative w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-cyan-400 rounded-full" />
        </button>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-cyan-500/20">
          {initials}
        </div>
      </div>
    </header>
  );
}
