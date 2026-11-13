import type { AuditIssue } from "../../llm-integration/types";
import { escapeHtml } from "./escape";

export function renderIssues(title: string, description: string, items: AuditIssue[] = [], tone = "green") {
  if (items.length === 0) {
    return `<section class="issue-section"><div class="section-heading"><span class="section-marker ${tone}"></span><div><h2>${escapeHtml(title)}</h2><p>${escapeHtml(description)}</p></div><span class="count">0</span></div><p class="empty-state">No items were reported in this category.</p></section>`;
  }

  const cards = items.map((item, index) => {
    const finding = item.finding || item.issue || "SEO opportunity identified";
    const priority = item.priority || item.estimated_impact || "Insight";
    const meta = [
      item.estimated_impact ? `<span>Impact: <b>${escapeHtml(item.estimated_impact)}</b></span>` : "",
      item.effort ? `<span>Effort: <b>${escapeHtml(item.effort)}</b></span>` : "",
      item.category ? `<span>Category: <b>${escapeHtml(item.category)}</b></span>` : "",
    ].filter(Boolean).join("");

    return `<article class="issue-card">
      <div class="issue-kicker"><span>${String(index + 1).padStart(2, "0")}</span><span class="priority">${escapeHtml(priority)}</span>${item.category ? `<span class="category">${escapeHtml(item.category)}</span>` : ""}</div>
      <h3>${escapeHtml(finding)}</h3>
      ${item.fix ? `<p>${escapeHtml(item.fix)}</p>` : ""}
      ${meta ? `<div class="issue-meta">${meta}</div>` : ""}
      ${item.falsifiability_check ? `<div class="verify"><b>How to verify</b><span>${escapeHtml(item.falsifiability_check)}</span></div>` : ""}
    </article>`;
  }).join("");

  return `<section class="issue-section"><div class="section-heading"><span class="section-marker ${tone}"></span><div><h2>${escapeHtml(title)}</h2><p>${escapeHtml(description)}</p></div><span class="count">${items.length}</span></div><div class="issue-list">${cards}</div></section>`;
}
