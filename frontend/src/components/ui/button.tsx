import * as React from "react";

import { cn } from "../../lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  primary: "bg-zinc-950 text-white shadow-sm shadow-zinc-950/15 hover:bg-zinc-800",
  secondary: "border border-zinc-200/80 bg-white/85 text-zinc-950 shadow-sm hover:border-zinc-300 hover:bg-white",
  ghost: "text-zinc-700 hover:bg-zinc-100/80 hover:text-zinc-950",
  danger: "bg-red-600 text-white shadow-sm shadow-red-900/15 hover:bg-red-700",
};

export function Button({ className, variant = "primary", type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition active:translate-y-px disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
