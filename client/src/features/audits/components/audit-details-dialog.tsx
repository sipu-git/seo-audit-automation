import type { AuditRow } from "@/src/features/audits/types/audit-types";
import dynamic from "next/dynamic";
import { AuditStatusBadge } from "@/components/dashboard-widgets";
import { Card } from "@/components/ui/card";
import {Dialog,DialogContent,DialogDescription,DialogHeader,DialogTitle} from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icons";
import { AuditReportLoadingSkeleton } from "@/features/audits/components/audit-details-loading-skeleton";

const AuditReport = dynamic(
  () => import("@/features/audits/components/audit-report").then((module) => module.AuditReport),
  { loading: () => <AuditReportLoadingSkeleton /> },
);

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AuditDetailsDialog({
  audit,
  onClose,
}: {
  audit: AuditRow | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={Boolean(audit)} onOpenChange={(open) => !open && onClose()}>
      {audit && (
        <DialogContent className="flex max-h-[calc(100dvh_-_1rem)] w-[calc(100vw_-_2rem)] max-w-[calc(100vw_-_2rem)] flex-col gap-0 overflow-hidden border-[var(--line)] bg-[var(--surface-raised)] p-0 text-[var(--ink)] sm:max-h-[calc(100dvh_-_2rem)] sm:max-w-7xl sm:rounded-2xl">
          <DialogHeader className="shrink-0 border-b border-[var(--line)] px-5 py-4 pr-12 sm:px-6">
            <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[var(--muted)]">
              Audit {audit.jobId}
            </p>
            <DialogTitle className="text-xl text-[var(--ink)]">
              Website audit results
            </DialogTitle>
            <DialogDescription className="break-all text-sm text-[var(--muted)]">
              {audit.url}
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-3 py-3 sm:px-5 sm:py-4 lg:px-6">
            <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
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
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
