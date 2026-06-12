import type * as React from "react";

import { cn } from "../../lib/utils";

export function Badge({ className, tone = "neutral", ...props }: React.HTMLAttributes<HTMLSpanElement> & { tone?: "neutral" | "green" | "red" }) {
  const tones = {
    neutral: "bg-zinc-100 text-zinc-700",
    green: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
  };
  return <span className={cn("rounded-full px-2 py-1 text-xs font-medium", tones[tone], className)} {...props} />;
}
