import { RefreshCw } from "lucide-react";
import type { AuditRow } from "@/src/features/audits/types/audit-types";
import { AuditStatusBadge } from "@/components/dashboard-widgets";
import { Icon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function ClientAuditHistory({
  audits,
  hydrated,
  selectedJobId,
  onSelect,
  error,
  refreshing,
  onRefresh,
}: {
  audits: AuditRow[];
  hydrated: boolean;
  selectedJobId: string | null;
  onSelect: (jobId: string) => void;
  error: string;
  refreshing: boolean;
  onRefresh: () => void;
}) {
  return (
    <Card className="flex h-full min-w-0 flex-col p-6 max-[560px]:p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="mb-2 text-[9px] font-bold tracking-[1.35px] text-[var(--muted)]">WORK HISTORY</p>
          <h2 className="text-base font-semibold tracking-tight text-[var(--ink)]">Recent audits</h2>
          <p className="mt-1 text-[10px] leading-relaxed text-[var(--muted)]">Follow each job from queue to finished report.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="grid size-6 place-items-center rounded-lg bg-[var(--green-soft)] px-2 text-[10px] font-bold text-[var(--green-dark)]">{audits.length}</span>
          {hydrated && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={refreshing}
              aria-label="Refresh audit history"
            >
              <RefreshCw className={refreshing ? "animate-spin" : ""} />
            </Button>
          )}
        </div>
      </div>
      {error ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center text-center text-[var(--muted)]" role="alert">
          <strong className="mt-2 text-[11px] text-[var(--ink)]">Couldn’t load your audits</strong>
          <p className="mt-1 max-w-[240px] text-[10px] leading-relaxed">{error}</p>
          <Button type="button" variant="outline" size="sm" onClick={onRefresh}>
            Try again
          </Button>
        </div>
      ) : !hydrated ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center text-center text-[var(--muted)]">
          <span className="size-4 animate-spin rounded-full border-2 border-[var(--line)] border-t-[var(--green)]" />
          Loading your audits…
        </div>
      ) : audits.length === 0 ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center text-center text-[var(--muted)]">
          <span className="grid size-10 place-items-center rounded-xl bg-[var(--green-soft)] text-[var(--green)]">
            <Icon name="file" />
          </span>
          <strong className="mt-2 text-[11px] text-[var(--ink)]">Your audit history starts here</strong>
          <p className="mt-1 max-w-[240px] text-[10px] leading-relaxed">Submit a website to see job progress and reports in this list.</p>
        </div>
      ) : (
        <div className="mt-4 flex max-h-[290px] flex-1 flex-col gap-1.5 overflow-y-auto pr-1">
          {audits.map((audit) => (
            <Button
              key={audit.jobId}
              type="button"
              variant="ghost"
              className={`flex w-full min-w-0 items-center gap-2.5 rounded-xl border text-left transition-colors ${selectedJobId === audit.jobId ? "border-[var(--green)] bg-[var(--green-soft)]" : "border-transparent bg-[var(--surface)] hover:border-[var(--line)] hover:bg-[var(--paper)]"}`}
              aria-pressed={selectedJobId === audit.jobId}
              onClick={() => onSelect(audit.jobId)}
            >
              <span className={`grid size-7 shrink-0 place-items-center rounded-lg ${audit.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" : audit.status === "FAILED" ? "bg-red-100 text-red-600" : "bg-blue-50 text-blue-600"}`}>
                <Icon
                  name={
                    audit.status === "COMPLETED"
                      ? "check"
                      : audit.status === "FAILED"
                        ? "alert"
                        : "clock"
                  }
                />
              </span>
              <span className="min-w-0 flex-1">
                <strong className="block overflow-hidden text-ellipsis whitespace-nowrap text-[10px] font-bold text-[var(--ink)]">{audit.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}</strong>
                <small className="mt-1 block overflow-hidden text-ellipsis whitespace-nowrap text-[9px] text-[var(--muted)]">
                  {audit.businessType} · {audit.city}
                </small>
              </span>
              <AuditStatusBadge state={audit.status} />
            </Button>
          ))}
        </div>
      )}
    </Card>
  );
}
