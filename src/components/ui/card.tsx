import * as React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: "green" | "red" | "blue" | "none";
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, glow = "none", ...props }, ref) => {
    const glowClasses = {
      green: "shadow-emerald-500/10 hover:shadow-emerald-500/20 hover:border-emerald-500/30",
      red: "shadow-red-500/10 hover:shadow-red-500/20 hover:border-red-500/30",
      blue: "shadow-cyan-500/10 hover:shadow-cyan-500/20 hover:border-cyan-500/30",
      none: "hover:border-white/15",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border border-white/8 bg-gradient-to-b from-white/8 to-white/3 backdrop-blur-xl shadow-xl transition-all duration-300",
          glowClasses[glow],
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1 p-6 pb-4", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-sm font-medium text-slate-400 uppercase tracking-wider", className)} {...props} />
  )
);
CardTitle.displayName = "CardTitle";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("px-6 pb-6", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center px-6 pb-6", className)} {...props} />
  )
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardContent, CardFooter };
