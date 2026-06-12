import * as React from "react";
import { X } from "lucide-react";

import { Button } from "./button";
import { cn } from "../../lib/utils";

type DialogProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

export function Dialog({ open, title, onClose, children }: DialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/35 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
          <h2 className="text-base font-semibold text-zinc-950">{title}</h2>
          <Button aria-label="Close dialog" className="h-8 w-8 px-0" variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className={cn("p-5")}>{children}</div>
      </div>
    </div>
  );
}

