import type { AuditRow } from "@/src/features/audits/types/audit-types";
import { AuditReport } from "@/src/features/audits/components/audit-report";
import { AuditStatusBadge } from "@/components/dashboard-widgets";
import { Icon } from "@/components/ui/icons";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Card } from "@/components/ui/card";

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function AdminAuditDetails({
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
          className="max-h-[92vh] w-[min(760px,94vw)] overflow-y-auto border-[var(--line)] bg-[var(--surface-raised)] p-6 text-[var(--ink)] sm:max-w-[760px]"
          aria-describedby="audit-detail-description"
        >
          <SheetHeader className="flex-row justify-between gap-4 border-b border-[var(--line)] pb-4 pr-11">
            <div>
              <p className="mb-2 text-[9px] font-bold tracking-[1.35px] text-[var(--muted)]">JOB {audit.jobId}</p>
              <SheetTitle className="text-[19px] text-[var(--ink)]">Audit details</SheetTitle>
              <SheetDescription
                id="audit-detail-description"
                className="mt-1.5 max-w-[600px] break-all text-[10px] text-[var(--muted)]"
              >
                {audit.url}
              </SheetDescription>
            </div>
          </SheetHeader>
          <div className="my-4 mb-4 flex flex-wrap items-center gap-3 text-[9px] text-[var(--muted)]">
            <AuditStatusBadge state={audit.status} showIndicator />
            <span>
              {audit.city}, {audit.state}
            </span>
            <span>{dateLabel(audit.createdAt)}</span>
          </div>
          {audit.status === "FAILED" && (
            <Card className="flex gap-3 rounded-[10px] border-red-200 bg-red-50 p-4 text-red-800 shadow-none dark:border-red-900 dark:bg-red-950/40 dark:text-red-200 [&_svg]:size-[17px] [&_svg]:shrink-0 [&_strong]:text-[11px] [&_p]:mt-1 [&_p]:text-[10px] [&_p]:leading-relaxed">
              <Icon name="alert" />
              <div>
                <strong>Audit failed</strong>
                <p>{audit.error || "No error detail was recorded."}</p>
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
          ) : (
            audit.status !== "FAILED" && (
              <Card className="flex gap-3 rounded-[10px] border-[var(--line)] bg-[var(--surface)] p-4 text-[var(--muted)] shadow-none [&_svg]:size-[17px] [&_svg]:shrink-0 [&_strong]:text-[11px] [&_strong]:text-[var(--ink)] [&_p]:mt-1 [&_p]:text-[10px] [&_p]:leading-relaxed">
                <Icon name="clock" />
                <div>
                  <strong>Report is not ready yet</strong>
                  <p>
                    Close this panel and refresh the queue after the worker
                    completes.
                  </p>
                </div>
              </Card>
            )
          )}
        </SheetContent>
      )}
    </Sheet>
  );
}
