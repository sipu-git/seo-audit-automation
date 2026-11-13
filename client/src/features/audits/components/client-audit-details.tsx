import type { AuditRow } from "@/src/features/audits/types/audit-types";
import { AuditReport } from "@/src/features/audits/components/audit-report";
import { AuditStatusBadge } from "@/components/dashboard-widgets";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icons";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ClientAuditDetails({
  audit,
  onClose,
}: {
  audit: AuditRow | null;
  onClose: () => void;
}) {
  return (
    <Sheet open={Boolean(audit)} onOpenChange={(open) => !open && onClose()}>
      {audit && (
        <SheetContent
          side="right"
          aria-describedby="client-audit-description"
          className="max-h-[92vh] w-[min(820px,95vw)] overflow-y-auto border-[var(--line)] bg-[var(--surface-raised)] p-6 text-[var(--ink)] sm:max-w-[820px]"
        >
          <SheetHeader className="border-b border-[var(--line)] pb-4 pr-10">
            <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[var(--muted)]">
              Audit {audit.jobId}
            </p>
            <SheetTitle className="text-xl text-[var(--ink)]">Website audit results</SheetTitle>
            <SheetDescription
              id="client-audit-description"
              className="break-all text-sm text-[var(--muted)]"
            >
              {audit.url}
            </SheetDescription>
          </SheetHeader>

          <div className="my-4 flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
            <AuditStatusBadge state={audit.status} showIndicator />
            <span>{audit.businessType}</span>
            <span>{audit.city}, {audit.state}</span>
            <span>{dateLabel(audit.createdAt)}</span>
          </div>

          {audit.status === "FAILED" && (
            <Card className="mb-4 flex gap-3 border-red-200 bg-red-50 p-4 text-red-800 shadow-none dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
              <Icon name="alert" />
              <div>
                <strong className="text-sm">Audit needs attention</strong>
                <p className="mt-1 text-sm">{audit.error || "No error detail was recorded."}</p>
              </div>
            </Card>
          )}

          {audit.analysis ? (
            <AuditReport
              result={{
                analysis: audit.analysis,
                dataSources: audit.dataSources ?? undefined,
                signals: audit.signals ?? undefined,
                business: {
                  url: audit.url,
                  businessType: audit.businessType,
                  city: audit.city,
                  state: audit.state,
                },
                note: audit.note ?? undefined,
              }}
              compact
              reportJobId={audit.reportAvailable ? audit.jobId : undefined}
            />
          ) : audit.status !== "FAILED" ? (
            <Card className="flex gap-3 border-[var(--line)] bg-[var(--surface)] p-4 text-[var(--muted)] shadow-none">
              <Icon name="clock" />
              <div>
                <strong className="text-sm text-[var(--ink)]">Report is not ready yet</strong>
                <p className="mt-1 text-sm">This panel updates automatically while the audit is running.</p>
              </div>
            </Card>
          ) : null}
        </SheetContent>
      )}
    </Sheet>
  );
}
