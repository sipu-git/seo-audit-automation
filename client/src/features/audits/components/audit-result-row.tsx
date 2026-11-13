import { ArrowUpRight, Trash2 } from "lucide-react";
import { AuditStatusBadge } from "@/components/dashboard-widgets";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TableCell, TableRow } from "@/components/ui/table";
import type { AuditRow } from "@/src/features/audits/types/audit-types";
import { cn } from "@/src/shared/lib/utils";

function domainLabel(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AuditResultRow({
  audit,
  onSelect,
  onDelete,
  deleting,
}: {
  audit: AuditRow;
  onSelect: (audit: AuditRow) => void;
  onDelete: (audit: AuditRow) => void;
  deleting: boolean;
}) {
  const domain = domainLabel(audit.url);
  const isActive = ["QUEUED", "PROCESSING"].includes(audit.status);

  return (
    <TableRow>
      <TableCell>
        <div className="flex min-w-0 items-center gap-3">
          <span className={cn(
            "grid size-9 shrink-0 place-items-center rounded-lg",
            "bg-[var(--green-soft)] text-sm font-semibold text-[var(--green-dark)]",
          )}>
            {domain.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <a
              href={audit.url}
              target="_blank"
              rel="noreferrer"
              className="block max-w-[240px] truncate font-medium text-[var(--ink)] hover:text-[var(--green-dark)]"
            >
              {domain} <ArrowUpRight className="ml-1 inline size-3" aria-hidden="true" />
            </a>
            <span className="block max-w-[240px] truncate text-xs text-[var(--muted)]">
              Job {audit.jobId}
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <span className="block font-medium text-[var(--ink)]">{audit.businessType}</span>
        <span className="text-xs text-[var(--muted)]">{audit.city}, {audit.state}</span>
      </TableCell>
      <TableCell>
        <div className="min-w-[120px] space-y-1.5">
          <AuditStatusBadge state={audit.status} showIndicator />
          {isActive && <AuditProgress progress={audit.progress} />}
        </div>
      </TableCell>
      <TableCell><AuditScore score={audit.overallScore} /></TableCell>
      <TableCell className="text-xs text-[var(--muted)]">{dateLabel(audit.createdAt)}</TableCell>
      <TableCell>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => onSelect(audit)}>
            {audit.analysis ? "View report" : "View details"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            aria-label={`Delete audit for ${domain}`}
            title="Delete audit"
            disabled={deleting}
            onClick={() => onDelete(audit)}
          >
            <Trash2 aria-hidden="true" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function AuditProgress({ progress }: { progress: number }) {
  return (
    <div className="flex items-center gap-2">
      <Progress className="h-1.5" value={progress} />
      <span className="text-xs text-[var(--muted)]">{Math.round(progress)}%</span>
    </div>
  );
}

function AuditScore({ score }: { score: number | null }) {
  if (score === null) return <span className="text-[var(--muted)]">—</span>;

  return (
    <span className="font-semibold text-[var(--green-dark)]">
      {score}
      <span className="ml-1 text-xs font-normal text-[var(--muted)]">/100</span>
    </span>
  );
}
