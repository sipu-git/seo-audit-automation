import { AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { DashboardMetricCard } from "@/components/dashboard-widgets";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function AdminQueueStatus({
  error,
  refreshing,
  lastUpdated,
  onRefresh,
}: {
  error: string;
  refreshing: boolean;
  lastUpdated: Date | null;
  onRefresh: () => void;
}) {
  const checkedAt = lastUpdated?.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Card
      className="flex min-h-[68px] items-center justify-between gap-4 rounded-xl border-[var(--line)] bg-[var(--surface)] px-4 py-3 shadow-sm"
      role="status"
      aria-live="polite"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={`grid size-9 shrink-0 place-items-center rounded-xl ${error ? "bg-red-50 text-red-600" : lastUpdated ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
        >
          {error ? (
            <AlertCircle aria-hidden="true" />
          ) : refreshing ? (
            <RefreshCw className="animate-spin" aria-hidden="true" />
          ) : (
            <CheckCircle2 aria-hidden="true" />
          )}
        </span>
        <div>
          <strong className="block text-xs text-[var(--ink)]">
            {error
              ? "Live updates paused"
              : refreshing
                ? "Checking for updates…"
                : "Audit queue is up to date"}
          </strong>
          <span className="mt-1 block text-[10px] text-[var(--muted)]">
            {error
              ? "We couldn’t refresh the job list. Your current results are still shown."
              : checkedAt ? `Last Updated ${checkedAt}` : "Connecting to the audit queue…"}
          </span>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={onRefresh}
        disabled={refreshing}
      >
        <RefreshCw
          className={refreshing ? "animate-spin" : ""}
          aria-hidden="true"
        />
        {refreshing ? "Refreshing…" : "Refresh"}
      </Button>
    </Card>
  );
}

export function AdminMetrics({
  total,
  active,
  completed,
  average,
}: {
  total: number;
  active: number;
  completed: number;
  average: number | null;
}) {
  return (
    <div className="grid grid-cols-4 gap-4 max-[1100px]:grid-cols-2 max-[560px]:grid-cols-1 max-[560px]:gap-2">
      <DashboardMetricCard
        icon="file"
        tone="lilac"
        label="AUDITS TOTAL"
        value={total}
        description="Stored in Supabase"
      />
      <DashboardMetricCard
        icon="clock"
        tone="mint"
        label="IN THE QUEUE"
        value={active}
        description="Queued or processing"
      />
      <DashboardMetricCard
        icon="check"
        tone="blue"
        label="COMPLETED"
        value={completed}
        description="Reports saved"
      />
      <DashboardMetricCard
        icon="chart"
        tone="peach"
        label="AVG. SEO SCORE"
        value={average ?? "—"}
        unit={average !== null ? "/100" : undefined}
        description="Across completed audits"
      />
    </div>
  );
}
