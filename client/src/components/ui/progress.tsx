import * as React from "react";
import { cn } from "@/src/shared/lib/utils";

function Progress({ className, value, ...props }: React.HTMLAttributes<HTMLDivElement> & { value?: number | null }) {
  const safeValue = Math.max(0, Math.min(100, value ?? 0));
  return <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={safeValue} className={cn("relative h-2 w-full overflow-hidden rounded-full bg-[var(--surface-raised)]", className)} {...props}><div className="h-full bg-[var(--green)] transition-all" style={{ width: `${safeValue}%` }} /></div>;
}

export { Progress };
