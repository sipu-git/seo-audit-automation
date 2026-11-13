import { Icon } from "@/components/ui/icons";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { AuditAnalysis, AuditIssue, AuditResult } from "@/src/features/audits/types/audit-types";

const breakdownLabels: Record<string, string> = {
  technical: "Technical SEO",
  on_page: "On-page SEO",
  content: "Content quality",
  core_web_vitals: "Core Web Vitals",
  schema: "Structured data",
};

function sourceStatusClass(status: string) {
  if (status === "live") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "mock") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-slate-200 bg-slate-50 text-slate-600";
}

function sourceStatusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function ScoreRing({ score, size = "large" }: { score: number; size?: "large" | "small" }) {
  const value = Math.max(0, Math.min(100, score));
  const dimension = size === "large" ? "size-24" : "size-12";
  return <div className={`grid ${dimension} shrink-0 place-items-center rounded-full`} style={{ background: `conic-gradient(var(--green) ${value * 3.6}deg,var(--line) ${value * 3.6}deg)` }}><div className={`grid ${size === "large" ? "size-[84px]" : "size-10"} place-content-center rounded-full bg-[var(--surface)] text-center`}><strong className={size === "large" ? "block text-2xl text-[var(--ink)]" : "block text-xs text-[var(--ink)]"}>{value}</strong><span className="text-[8px] text-[var(--muted)]">/100</span></div></div>;
}

function IssueCard({ issue, index }: { issue: AuditIssue; index: number }) {
  return <Card className="rounded-lg border-[var(--line)] bg-[var(--surface-raised)] p-3 shadow-none">
    <div className="mb-2 flex items-center gap-2"><span className="text-[8px] font-bold tracking-wide text-[var(--muted)]">{String(index + 1).padStart(2, "0")}</span><span className="rounded-md bg-[var(--green-soft)] px-1.5 py-1 text-[7px] font-bold uppercase text-[var(--green-dark)]">{issue.priority || issue.estimated_impact || "INSIGHT"}</span>{issue.category && <span className="ml-auto text-[8px] text-[var(--muted)]">{issue.category}</span>}</div>
    <h4 className="text-[11px] font-semibold text-[var(--ink)]">{issue.finding || issue.issue || "SEO opportunity identified"}</h4>
    {issue.fix && <p className="mt-1 text-[10px] leading-relaxed text-[var(--muted)]">{issue.fix}</p>}
    {(issue.estimated_impact || issue.effort) && <div className="mt-2 flex flex-wrap gap-3 text-[9px] text-[var(--muted)]">{issue.estimated_impact && <span>Impact: <strong>{issue.estimated_impact}</strong></span>}{issue.effort && <span>Effort: <strong>{issue.effort}</strong></span>}</div>}
    {issue.falsifiability_check && <div className="mt-2 flex items-start gap-1.5 rounded-md bg-[var(--green-soft)] p-2 text-[9px] text-[var(--green-dark)]"><Icon name="check" /><span>Measure: {issue.falsifiability_check}</span></div>}
  </Card>;
}

function IssueSection({ title, subtitle, items, tone }: { title: string; subtitle: string; items?: AuditIssue[]; tone: string }) {
  if (!items?.length) return null;
  return <Card className="rounded-xl border-[var(--line)] bg-[var(--surface)] p-4 shadow-none">
    <div className="mb-3 flex items-center justify-between gap-2"><div className="flex items-center gap-2"><span className={`h-7 w-1 rounded-full ${tone}`} /><div><h3 className="text-xs font-semibold text-[var(--ink)]">{title}</h3><p className="mt-1 text-[9px] text-[var(--muted)]">{subtitle}</p></div></div><span className="grid size-6 place-items-center rounded-lg bg-[var(--paper)] text-[10px] text-[var(--muted)]">{items.length}</span></div>
    <div className="grid gap-2">{items.map((item, index) => <IssueCard key={`${title}-${index}`} issue={item} index={index} />)}</div>
  </Card>;
}

export function AuditReport({ result, compact = false, reportJobId }: { result: AuditResult; compact?: boolean; reportJobId?: string }) {
  const analysis = result.analysis as AuditAnalysis | undefined;
  if (!analysis) return null;
  const sources = result.dataSources ?? {};
  const signals = result.signals ?? {};
  const rows = Object.entries(analysis.score_breakdown ?? {});

  return <div className="grid gap-4">
    <Card className={`grid gap-5 rounded-[13px] border-[var(--line)] bg-gradient-to-br from-[var(--surface)] to-[var(--paper)] p-5 shadow-none ${compact ? "grid-cols-1" : "grid-cols-[1.1fr_.9fr] max-[1100px]:grid-cols-1"}`}>
      <div className="flex items-center gap-4"><ScoreRing score={analysis.overall_score ?? 0} /><div><span className="inline-flex items-center gap-2 text-[8px] font-bold tracking-widest text-[var(--green-dark)]"><span className="size-1.5 rounded-full bg-[var(--green)]" /> AUDIT COMPLETE</span><h2 className="my-1 text-base font-semibold text-[var(--ink)]">SEO health overview</h2><p className="max-w-[510px] text-[10px] leading-relaxed text-[var(--muted)]">{analysis.executive_summary || "Your audit is ready. Explore the findings and prioritized next steps below."}</p></div></div>
      {rows.length > 0 && <div className="grid grid-cols-2 content-center gap-3.5">{rows.map(([key, value]) => <div key={key}><div className="flex justify-between gap-2 text-[9px] text-[var(--muted)]"><span>{breakdownLabels[key] || key.replaceAll("_", " ")}</span><strong className="text-[var(--ink)]">{value}</strong></div><div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[var(--line)]"><span className="block h-full rounded-full bg-[var(--green)]" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div></div>)}</div>}
    </Card>

    <div className="flex flex-wrap items-center gap-2"><div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface)] px-2.5 py-1.5 text-[8px] font-semibold text-[var(--muted)]"><span className="size-1.5 rounded-full bg-[var(--green)]" /> Live crawl</div><span className="ml-auto min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-[9px] text-[var(--muted)]">{signals.crawl?.finalUrl || result.business?.url || "Website audit"}</span>{reportJobId && <Button asChild variant="outline" size="sm"><a href={`/api/audits/${encodeURIComponent(reportJobId)}/report`}><Download aria-hidden="true" /> Download PDF</a></Button>}</div>

    <div className="grid grid-cols-[minmax(0,1.65fr)_minmax(245px,.8fr)] items-start gap-4 max-[780px]:grid-cols-1">
      <div className="grid gap-3.5">
        <IssueSection title="Critical issues" subtitle="Address these first to protect visibility" items={analysis.critical_issues} tone="bg-red-400" />
        <IssueSection title="Important findings" subtitle="High-value improvements for your next sprint" items={analysis.important_issues} tone="bg-amber-400" />
        <IssueSection title="Recommended actions" subtitle="Prioritized steps based on the signals we analyzed" items={analysis.recommendations} tone="bg-emerald-400" />
      </div>
      <aside className="grid gap-3.5 max-[780px]:grid-cols-1">
        <IssueSection title="Quick wins" subtitle="Small changes with near-term value" items={analysis.quick_wins} tone="bg-sky-400" />
        <Card className="rounded-xl border-[var(--line)] bg-[var(--surface)] p-4 shadow-none"><div className="mb-3 flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-[var(--green-soft)] text-[var(--green)]"><Icon name="chart" /></span><div><h3 className="text-xs font-semibold text-[var(--ink)]">Signals in this report</h3><p className="text-[9px] text-[var(--muted)]">Know what informed your analysis</p></div></div>{Object.entries(sources).map(([name, source]) => <div className="flex items-center justify-between border-t border-[var(--line)] py-2 text-[9px] text-[var(--muted)]" key={name}><span>{name.replaceAll(/([A-Z])/g, " $1").replaceAll("-", " ")}</span><span className={`rounded-full border px-2 py-1 ${sourceStatusClass(source)}`}>{sourceStatusLabel(source)}</span></div>)}{result.note && <p className="mt-2 text-[9px] leading-relaxed text-[var(--muted)]">{result.note}</p>}</Card>
        <Card className="flex gap-2 rounded-xl border-violet-200 bg-gradient-to-br from-violet-50 to-sky-50 p-3 text-slate-700 shadow-none"><Icon name="spark" /><div><strong className="text-[11px]">Make progress, not guesses</strong><p className="mt-1 text-[10px]">Each action includes a way to verify whether the change worked.</p></div></Card>
      </aside>
    </div>
  </div>;
}

export { ScoreRing };
