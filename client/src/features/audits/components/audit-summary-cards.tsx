import { Activity, AlertCircle, CheckCircle2, Clock3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type MetricTone = "green" | "blue" | "amber" | "violet";

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: typeof Activity;
  tone: MetricTone;
}) {
  const iconTone = {
    green: "bg-emerald-100 text-emerald-700",
    blue: "bg-sky-100 text-sky-700",
    amber: "bg-amber-100 text-amber-700",
    violet: "bg-violet-100 text-violet-700",
  }[tone];

  return (
    <Card className="border-[var(--line)] bg-[var(--surface)] shadow-sm">
      <CardContent className="flex items-center gap-4 p-5">
        <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${iconTone}`}>
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-[var(--muted)]">{label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-[var(--ink)]">{value}</p>
          <p className="mt-1 truncate text-xs text-[var(--muted)]">{detail}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function AuditSummaryCards({
  total,
  completed,
  active,
  failed,
  averageScore,
}: {
  total: number;
  completed: number;
  active: number;
  failed: number;
  averageScore: number | null;
}) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Audit summary">
      <MetricCard label="Total audits" value={total} detail="Your latest audit jobs" icon={Activity} tone="green" />
      <MetricCard
        label="Completed"
        value={completed}
        detail="Reports ready to review"
        icon={CheckCircle2}
        tone="blue"
      />
      <MetricCard label="In progress" value={active} detail="Queued or being analyzed" icon={Clock3} tone="amber" />
      <MetricCard
        label="Average SEO score"
        value={averageScore === null ? "—" : `${averageScore}/100`}
        detail={`${failed} failed audit${failed === 1 ? "" : "s"}`}
        icon={AlertCircle}
        tone="violet"
      />
    </section>
  );
}
