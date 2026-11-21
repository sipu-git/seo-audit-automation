import type { AuditPreviewInput, AuditSignals } from "./types";

export const SYSTEM_PROMPT = `You are a senior SEO analyst with 15+ years experience specialising in Indian local business websites, healthcare, dental, and real estate sectors.
You produce honest, falsifiable, prioritised SEO audit reports.
Your output must be valid JSON only — no markdown, no preamble.
Every recommendation must include: finding, fix, estimated_impact (High/Medium/Low), effort (Hours/Days/Weeks), falsifiability_check (how we know if this worked).`;

export function buildUserPrompt(business: AuditPreviewInput, signals: AuditSignals) {
  return `Analyse the following SEO signals for: ${business.url}
Business type: ${business.businessType}
Business location: ${business.city}, ${business.state}, India

=== ON-PAGE DATA ===
${JSON.stringify({
    title: signals.crawl.title,
    metaDescription: signals.crawl.metaDescription,
    headings: signals.crawl.headings,
    links: signals.crawl.links,
    imagesMissingAlt: signals.crawl.imagesMissingAlt,
    canonical: signals.crawl.canonical,
    siteSummary: signals.crawl.siteSummary,
    crawledPages: signals.crawl.pages,
  }, null, 2)}
=== TECHNICAL DATA ===
${JSON.stringify({
    requestedUrl: signals.crawl.requestedUrl,
    finalUrl: signals.crawl.finalUrl,
    httpStatus: signals.crawl.status,
    robots: signals.crawl.robots,
    sitemaps: signals.crawl.sitemaps,
    crawlErrors: signals.crawl.crawlErrors,
  }, null, 2)}
=== CORE WEB VITALS ===
${JSON.stringify(signals.pagespeed, null, 2)}
=== SCHEMA.ORG DATA ===
${JSON.stringify({
    homePage: signals.crawl.schema,
    validation: signals.crawl.schemaValidation,
    pageResults: signals.crawl.pages,
  }, null, 2)}
=== GOOGLE SEARCH CONSOLE ===
${JSON.stringify(signals.googleSearchConsole, null, 2)}
=== KEYWORD RANKINGS ===
${JSON.stringify(signals.keywordRankings, null, 2)}

Apply these constraints:
Always include all four array fields: critical_issues, important_issues, quick_wins, and recommendations. If an array has no items, return it as [].
- Return no markdown, code fences, preamble, or text outside the JSON object.
- overall_score and every score_breakdown value must be an integer from 0 to 100.
- critical_issues: at most 5 items; important_issues: at most 8 items.
- quick_wins: at most 5 items, and each must have effort of 2 hours or less.
- For quick_wins, use effort "Hours" and make the fix explicitly achievable within two hours.
- Every recommendation must include finding, fix, estimated_impact, effort, and falsifiability_check.
- Use only the priority values CRITICAL, HIGH, MEDIUM, LOW.
- Use only the category values Technical, OnPage, Content, Schema, CWV.
- Use only the estimated_impact values High, Medium, Low; effort values Hours, Days, Weeks.
- executive_summary must be plain English and no more than 3 sentences.

Respond ONLY with this JSON structure — no other text:
{
  "audit_version": "v1.0",
  "overall_score": 0,
  "score_breakdown": { "technical": 0, "on_page": 0, "content": 0, "core_web_vitals": 0, "schema": 0 },
  "critical_issues": [],
  "important_issues": [],
  "quick_wins": [],
  "recommendations": [{
    "priority": "HIGH",
    "category": "Technical",
    "finding": "",
    "fix": "",
    "estimated_impact": "Medium",
    "effort": "Hours",
    "falsifiability_check": ""
  }],
  "executive_summary": ""
}`;
}
