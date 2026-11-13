import type { AuditPdfData } from "../types";
import { escapeHtml, formatReportDate } from "./escape";
import { renderIssues } from "./sections";
import { reportStyles } from "./styles";

const breakdownLabels: Record<string, string> = {
  technical: "Technical SEO",
  on_page: "On-page SEO",
  content: "Content quality",
  core_web_vitals: "Core Web Vitals",
  schema: "Structured data",
};

export function buildAuditReportHtml(data: AuditPdfData): string {
  const analysis = data.analysis;
  const breakdown = Object.entries(analysis.score_breakdown ?? {}).map(([key, score]) => {
    const value = Math.max(0, Math.min(100, Number(score) || 0));
    const label = breakdownLabels[key] ?? key.replaceAll("_", " ");
    return `<div class="breakdown-row"><div class="breakdown-label"><span>${escapeHtml(label)}</span><b>${value}</b></div><div class="track"><i style="width:${value}%"></i></div></div>`;
  }).join("");
  const sources = Object.entries(data.dataSources ?? {}).map(([name, source]) => `<li><b>${escapeHtml(name.replaceAll(/([A-Z])/g, " $1").replaceAll("-", " "))}</b>: ${escapeHtml(source)}</li>`).join("");
  const score = Math.max(0, Math.min(100, Number(analysis.overall_score) || 0));

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SEO audit report - ${escapeHtml(data.business.url)}</title><style>${reportStyles}</style></head><body>
    <header class="brand"><strong>Crawlix</strong><span>Website audit report · ${escapeHtml(data.jobId)}</span></header>
    <section class="hero"><p class="eyebrow">SEO audit report</p><h1>${escapeHtml(data.business.businessType)} visibility review</h1><p class="site">${escapeHtml(data.business.url)}</p><div class="meta"><span>${escapeHtml(data.business.city)}, ${escapeHtml(data.business.state)}, India</span><span>Generated ${escapeHtml(formatReportDate(data.createdAt))}</span></div></section>
    <section class="score-panel"><div class="score">${score}<small>/100</small></div><div class="score-copy"><p class="eyebrow">Overall SEO score</p><h2>SEO health overview</h2><p>${escapeHtml(analysis.executive_summary || "Your audit is complete. Review the findings and recommended actions below.")}</p></div></section>
    ${breakdown ? `<section><h2 class="section-title">Score breakdown</h2><div class="breakdown">${breakdown}</div></section>` : ""}
    ${renderIssues("Critical issues", "Address these first to protect search visibility.", analysis.critical_issues, "red")}
    ${renderIssues("Important findings", "High-value improvements for your next sprint.", analysis.important_issues, "amber")}
    ${renderIssues("Quick wins", "Small changes with near-term value.", analysis.quick_wins, "blue")}
    ${renderIssues("Recommended actions", "Prioritized steps based on the available signals.", analysis.recommendations, "green")}
    <section class="sources"><h2>Data sources</h2><ul>${sources || "<li>Source metadata was not included.</li>"}</ul>${data.note ? `<p class="note">${escapeHtml(data.note)}</p>` : ""}</section>
  </body></html>`;
}
