import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color?: "green" | "red" | "blue" | "none";
  className?: string;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trendValue,
  color = "none",
  className,
}: StatsCardProps) {
  const iconColors = {
    green: "text-emerald-400 bg-emerald-400/10",
    red: "text-red-400 bg-red-400/10",
    blue: "text-cyan-400 bg-cyan-400/10",
    none: "text-slate-400 bg-slate-400/10",
  };

  const valueColors = {
    green: "text-emerald-400",
    red: "text-red-400",
    blue: "text-cyan-400",
    none: "text-white",
  };

  return (
    <Card glow={color} className={cn("group", className)}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", iconColors[color])}>
            <Icon className="w-5 h-5" />
          </div>
          {trendValue && (
            <span className={cn("text-xs font-medium px-2 py-1 rounded-lg", color === "green" ? "bg-emerald-500/10 text-emerald-400" : color === "red" ? "bg-red-500/10 text-red-400" : "bg-cyan-500/10 text-cyan-400")}>
              {trendValue}
            </span>
          )}
        </div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">{title}</p>
        <p className={cn("text-2xl font-bold tracking-tight", valueColors[color])}>{value}</p>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}
