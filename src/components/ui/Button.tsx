import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", fullWidth, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-body font-medium tracking-wide transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40",
          variant === "primary" && "bg-ink text-ivory hover:bg-accent-dark",
          variant === "secondary" &&
            "border border-ink/15 bg-transparent text-ink hover:border-ink/40",
          variant === "ghost" && "text-ink hover:bg-ink/5",
          variant === "danger" && "bg-red-800 text-ivory hover:bg-red-900",
          fullWidth && "w-full",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
