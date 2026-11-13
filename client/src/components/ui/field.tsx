import * as React from "react";
import { cn } from "@/src/shared/lib/utils";
import { Label } from "@/components/ui/label";

function Field({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("grid gap-2", className)} {...props} />;
}
function FieldLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
  return <Label className={cn("block text-xs font-semibold text-[var(--ink)]", className)} {...props} />;
}
function FieldDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-xs leading-relaxed text-[var(--muted)]", className)} {...props} />;
}
function FieldError({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  if (!children) return null;
  return <p role="alert" className={cn("text-xs font-medium text-red-700", className)} {...props}>{children}</p>;
}

export { Field, FieldLabel, FieldDescription, FieldError };
