import type { CSSProperties } from "react";
import type { AuditRow } from "@/src/features/audits/types/audit-types";
import { AuditReport } from "@/src/features/audits/components/audit-report";
import { AuditStatusBadge } from "@/components/dashboard-widgets";
import { Icon } from "@/components/ui/icons";
import { Card } from "@/components/ui/card";

export function ClientSelectedAudit({ audit }: { audit: AuditRow }) {
  const isComplete = audit.status === "COMPLETED";
  const isFailed = audit.status === "FAILED";
  const progress = Math.min(100, Math.max(0, audit.progress));

  return (
    <Card className="m-0 p-6 max-[560px]:p-4">
      <div className="mb-4 flex items-center justify-between gap-3 max-[560px]:items-start">
        <div>
          <p className="mb-2 text-[9px] font-bold tracking-[1.35px] text-[var(--muted)]">AUDIT {audit.jobId}</p>
          <h2 className="text-[17px] font-semibold text-[var(--ink)]">
            {isComplete
              ? "Your report is ready"
              : isFailed
                ? "This audit needs attention"
                : "Your audit is underway"}
          </h2>
          <p className="break-all text-[10px] text-[var(--muted)]">{audit.url}</p>
        </div>
        <AuditStatusBadge state={audit.status} />
      </div>
      {isComplete && audit.analysis ? (
        <AuditReport
          result={{
            analysis: audit.analysis,
            dataSources: audit.dataSources ?? undefined,
            signals: audit.signals ?? undefined,
            note: audit.note ?? undefined,
            business: {
              url: audit.url,
              businessType: audit.businessType,
              city: audit.city,
              state: audit.state,
            },
          }}
          reportJobId={audit.reportAvailable ? audit.jobId : undefined}
        />
      ) : isFailed ? (
        <Card className="flex gap-3 rounded-[10px] border-red-200 bg-red-50 p-4 text-red-700 shadow-none">
          <Icon name="alert" />
          <div>
            <strong className="text-[11px]">We couldn’t finish this audit.</strong>
            <p className="mt-1 text-[10px] leading-relaxed">
              {audit.error ||
                "Check that the website is reachable, then try again."}
            </p>
          </div>
        </Card>
      ) : (
        <Card className="rounded-xl border-[var(--line)] bg-gradient-to-br from-[var(--surface)] to-[var(--paper)] p-5 shadow-none">
          <div className="flex items-center gap-3.5">
            <div
              className="grid size-[52px] shrink-0 place-items-center rounded-full"
              style={
                { background: `conic-gradient(var(--green) ${progress * 3.6}deg, var(--line) ${progress * 3.6}deg)` } as CSSProperties
              }
            >
              <span className="grid size-[42px] place-items-center rounded-full bg-[var(--surface)] text-[11px] font-bold text-[var(--green-dark)]">{progress}%</span>
            </div>
            <div>
              <strong className="text-xs text-[var(--ink)]">
                {audit.status === "PROCESSING"
                  ? "Analyzing your website"
                  : "Waiting for an available worker"}
              </strong>
              <p className="mt-1 text-[10px] leading-relaxed text-[var(--muted)]">
                We’ll update this view automatically as the audit moves through
                the pipeline.
              </p>
            </div>
          </div>
          <div className="mt-5 flex justify-between gap-2 border-t border-[var(--line)] pt-4 max-[560px]:flex-wrap">
            <span className="flex items-center gap-1.5 text-[9px] text-[var(--green-dark)]">
              <i className="grid size-[18px] place-items-center rounded-full bg-[var(--green-soft)] text-[8px] not-italic">
                <Icon name="check" />
              </i>
              Queued
            </span>
            <span className={`flex items-center gap-1.5 text-[9px] ${audit.progress >= 20 ? "text-blue-600" : "text-[var(--muted)]"}`}>
              <i className="grid size-[18px] place-items-center rounded-full bg-[var(--paper)] text-[8px] not-italic">2</i>Website crawl
            </span>
            <span className={`flex items-center gap-1.5 text-[9px] ${audit.progress >= 55 ? "text-blue-600" : "text-[var(--muted)]"}`}>
              <i className="grid size-[18px] place-items-center rounded-full bg-[var(--paper)] text-[8px] not-italic">3</i>SEO analysis
            </span>
            <span className={`flex items-center gap-1.5 text-[9px] ${isComplete ? "text-[var(--green-dark)]" : "text-[var(--muted)]"}`}>
              <i className="grid size-[18px] place-items-center rounded-full bg-[var(--paper)] text-[8px] not-italic">4</i>Report ready
            </span>
          </div>
        </Card>
      )}
    </Card>
  );
}
