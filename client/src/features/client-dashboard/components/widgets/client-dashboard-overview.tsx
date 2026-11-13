import { DashboardMetricCard } from "@/components/dashboard-widgets";
import { Icon } from "@/components/ui/icons";
import { Card } from "@/components/ui/card";

export function ClientWelcome() {
  return (
    <Card
      className="relative flex min-h-[255px] justify-between overflow-hidden rounded-[18px] border-[var(--line)] bg-gradient-to-br from-[var(--green-soft)] via-[var(--surface)] to-[var(--paper)] px-9 py-7 max-[780px]:px-5"
      role="region"
      aria-label="Client dashboard introduction"
    >
      <div className="relative z-10 max-w-[525px]">
        <span className="inline-flex items-center gap-2 text-[9px] font-bold tracking-[1.3px] text-[var(--green-dark)]">
          <span className="size-1.5 rounded-full bg-[var(--green)]" /> YOUR GROWTH DESK
        </span>
        <h2 className="my-4 text-[clamp(28px,3.4vw,39px)] font-semibold leading-[1.08] tracking-[-1.5px] text-[var(--ink)]">
          Make your next move
          <br />a more informed one.
        </h2>
        <p className="max-w-[450px] text-xs leading-relaxed text-[var(--muted)]">
          Get a clear view of your site’s search health, then focus on the
          improvements with the greatest potential impact.
        </p>
        <div className="mt-5 flex flex-wrap gap-5 text-[10px] font-semibold text-[var(--muted)]">
          <span className="inline-flex items-center gap-1.5">
            <Icon name="check" /> Actionable recommendations
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Icon name="check" /> Local SEO signals
          </span>
        </div>
      </div>
      <div className="relative w-[36%] min-w-[280px] max-[780px]:hidden" aria-hidden="true">
        <div className="absolute -right-1 top-0 h-48 w-64 rotate-12 rounded-[50%] border border-[var(--line)] opacity-60" />
        <div className="absolute right-8 top-5 h-40 w-56 -rotate-12 rounded-[50%] border border-[var(--line)] opacity-60" />
        <div className="absolute right-8 top-0 size-52 rounded-full bg-[radial-gradient(circle,var(--green-soft),transparent_72%)] opacity-80" />
        <div className="absolute right-12 top-6 z-10 w-[220px] rotate-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-xl">
          <span className="text-[8px] font-bold tracking-wide text-[var(--muted)]">SEARCH VISIBILITY</span>
          <div className="mt-3 flex h-[70px] items-end gap-1.5 border-b border-[var(--line)] bg-[repeating-linear-gradient(to_bottom,transparent_0,transparent_22px,var(--line)_23px)]">
            {([24, 35, 30, 44, 41, 58, 52, 66, 62, 75, 70, 93]).map((height, index) => (
              <span key={index} className="w-[11px] rounded-t-md bg-gradient-to-b from-emerald-400 to-emerald-200" style={{ height: `${height}%` }} />
            ))}
          </div>
          <div className="mt-2 text-[9px] text-[var(--muted)]">
            <span>↗</span> Growing signal
          </div>
        </div>
        <div className="absolute -right-1 bottom-3 z-20 flex rotate-[-3deg] items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3 shadow-lg">
          <span className="grid size-7 place-items-center rounded-lg bg-[var(--green-soft)] text-[var(--green)]">✓</span>
          <div>
            <strong className="block text-[9px] text-[var(--ink)]">Ready to improve</strong>
            <small className="mt-1 block text-[8px] text-[var(--muted)]">One clear step at a time</small>
          </div>
        </div>
        <span className="absolute right-3 top-2 z-20 text-xl text-[var(--green)]">✦</span>
        <span className="absolute bottom-7 left-3 z-20 text-2xl text-[var(--green)]">✧</span>
      </div>
    </Card>
  );
}

export function ClientMetrics({
  total,
  active,
  completed,
}: {
  total: number;
  active: number;
  completed: number;
}) {
  return (
    <div className="grid grid-cols-3 gap-4 max-[560px]:grid-cols-1 max-[560px]:gap-2">
      <DashboardMetricCard
        icon="file"
        tone="lilac"
        label="YOUR AUDITS"
        value={total}
        description="Tracked in this browser"
      />
      <DashboardMetricCard
        icon="clock"
        tone="mint"
        label="IN PROGRESS"
        value={active}
        description="Background analysis jobs"
      />
      <DashboardMetricCard
        icon="check"
        tone="blue"
        label="REPORTS READY"
        value={completed}
        description="Completed audit reports"
      />
    </div>
  );
}
