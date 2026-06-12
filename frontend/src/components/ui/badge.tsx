import type * as React from "react";

import { cn } from "../../lib/utils";

export function Badge({ className, tone = "neutral", ...props }: React.HTMLAttributes<HTMLSpanElement> & { tone?: "neutral" | "green" | "red" }) {
  const tones = {
    neutral: "border-zinc-200 bg-zinc-100 text-zinc-700",
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    red: "border-red-200 bg-red-50 text-red-700",
  };
  return (
    <span
      className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-bold uppercase tracking-[0.06em]", tones[tone], className)}
      {...props}
    />
  );
}
