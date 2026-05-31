"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, ArrowLeftRight, BarChart3, Settings } from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/transactions", icon: ArrowLeftRight, label: "Transactions" },
  { href: "/reports", icon: BarChart3, label: "Reports" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 border-t border-white/5 backdrop-blur-xl">
      <div className="flex">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 py-3 gap-1 text-xs font-medium transition-all duration-200",
                isActive ? "text-cyan-400" : "text-slate-600 hover:text-slate-400"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
              {isActive && (
                <div className="absolute bottom-0 w-8 h-0.5 bg-cyan-400 rounded-t-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
