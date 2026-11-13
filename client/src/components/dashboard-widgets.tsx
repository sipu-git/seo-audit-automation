import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icons";

type MetricIcon = "file" | "clock" | "check" | "chart";
type MetricTone = "lilac" | "mint" | "blue" | "peach";

export function DashboardMetricCard({
  icon,
  tone,
  label,
  value,
  unit,
  description,
}: {
  icon: MetricIcon;
  tone: MetricTone;
  label: string;
  value: string | number;
  unit?: string;
  description: string;
}) {
  return (
    <Card className="flex min-h-[94px] items-center gap-3.5 rounded-[14px] border-[var(--line)] bg-[var(--surface)] p-[18px_20px] shadow-sm">
      <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${tone === "lilac" ? "bg-violet-100 text-violet-700" : tone === "mint" ? "bg-emerald-100 text-emerald-700" : tone === "blue" ? "bg-sky-100 text-sky-700" : "bg-orange-100 text-orange-700"}`}>
        <Icon name={icon} />
      </span>
      <div>
        <span className="mb-1.5 block text-[8px] font-bold tracking-[.9px] text-[var(--muted)]">{label}</span>
        <strong className="block text-[22px] font-semibold leading-none tracking-tight text-[var(--ink)]">
          {value}
          {unit && <small className="ml-1 inline text-[10px] font-normal">{unit}</small>}
        </strong>
        <small className="mt-1.5 block text-[9px] text-[var(--muted)]">{description}</small>
      </div>
    </Card>
  );
}

export function auditStateLabel(state: string) {
  if (state === "COMPLETED" || state === "completed") return "Completed";
  if (state === "FAILED" || state === "failed") return "Failed";
  if (["PROCESSING", "processing", "active"].includes(state)) return "In progress";
  return "Queued";
}

export function AuditStatusBadge({
  state,
  showIndicator = false,
}: {
  state: string;
  showIndicator?: boolean;
}) {
  const normalizedState = state.toLowerCase();
  const variant =
    state === "COMPLETED" || state === "completed"
      ? "success"
      : state === "FAILED" || state === "failed"
        ? "destructive"
        : ["PROCESSING", "processing", "active"].includes(state)
          ? "secondary"
          : "warning";

  return (
    <Badge
      variant={variant}
      className={`rounded-full px-2 py-1 text-[9px] ${normalizedState}`}
    >
      {showIndicator && (
        <i
          aria-hidden="true"
          className="mr-1 inline-block size-[5px] shrink-0 rounded-full bg-current align-middle"
        />
      )}
      {auditStateLabel(state)}
    </Badge>
  );
}
