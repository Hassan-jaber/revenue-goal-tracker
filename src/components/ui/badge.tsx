import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-slate-700 text-slate-300",
        income: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
        expense: "bg-red-500/15 text-red-400 border border-red-500/20",
        blue: "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20",
        warning: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
