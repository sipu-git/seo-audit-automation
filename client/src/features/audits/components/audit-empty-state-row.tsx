import { Search } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";

export function AuditEmptyStateRow({
  loading,
  error,
  hasAudits,
}: {
  loading: boolean;
  error: boolean;
  hasAudits: boolean;
}) {
  const title = loading
    ? "Loading audits"
    : hasAudits
      ? "No matching audits"
      : error
        ? "Unable to load audits"
        : "No audits yet";
  const message = loading
    ? "Loading your audit results…"
    : hasAudits
      ? "Try a different search or status filter."
      : error
        ? "Couldn’t load audit results. Use ‘Try again’ above to retry."
        : "Run a website audit from your dashboard to see results here.";

  return (
    <TableRow>
      <TableCell colSpan={6} className="h-44 text-center">
        <div className="mx-auto flex max-w-sm flex-col items-center gap-2 text-[var(--muted)]">
          <span className="grid size-10 place-items-center rounded-full bg-[var(--surface-raised)]">
            <Search className="size-4" />
          </span>
          <strong className="text-sm text-[var(--ink)]">{title}</strong>
          <span className="text-xs">{message}</span>
        </div>
      </TableCell>
    </TableRow>
  );
}
