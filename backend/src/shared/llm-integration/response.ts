import type { AuditAnalysis, AuditIssue } from "./types";

const issueFields = [
  "issue",
  "finding",
  "priority",
  "category",
  "fix",
  "estimated_impact",
  "effort",
  "falsifiability_check",
] as const;
const priorities = new Set(["CRITICAL", "HIGH", "MEDIUM", "LOW"]);
const categories = new Set(["Technical", "OnPage", "Content", "Schema", "CWV"]);
const impacts = new Set(["High", "Medium", "Low"]);
const efforts = new Set(["Hours", "Days", "Weeks"]);

function parseIssueList(value: unknown, field: string, maxItems?: number): AuditIssue[] {
  if (!Array.isArray(value)) {
    throw new Error(`Gemini response has an invalid ${field} array.`);
  }
  if (maxItems !== undefined && value.length > maxItems) {
    throw new Error(`Gemini response has too many items in ${field}.`);
  }

  return value.map((item, index) => {
    if (typeof item === "string" && item.trim()) return { issue: item.trim() };
    if (typeof item !== "object" || item === null || Array.isArray(item)) {
      throw new Error(`Gemini response has an invalid item in ${field} at index ${index}.`);
    }

    const issue = item as Record<string, unknown>;
    if (issueFields.some((key) => key in issue && typeof issue[key] !== "string")) {
      throw new Error(`Gemini response has a non-string issue field in ${field} at index ${index}.`);
    }
    if (!(typeof issue.finding === "string" && issue.finding.trim()) &&
      !(typeof issue.issue === "string" && issue.issue.trim())) {
      throw new Error(`Gemini response item ${index + 1} in ${field} needs an issue or finding.`);
    }

    if (issue.priority !== undefined && !priorities.has(String(issue.priority))) {
      throw new Error(`Gemini response has an invalid priority in ${field} at index ${index}.`);
    }
    if (issue.category !== undefined && !categories.has(String(issue.category))) {
      throw new Error(`Gemini response has an invalid category in ${field} at index ${index}.`);
    }
    if (issue.estimated_impact !== undefined && !impacts.has(String(issue.estimated_impact))) {
      throw new Error(`Gemini response has an invalid estimated_impact in ${field} at index ${index}.`);
    }
    if (issue.effort !== undefined && !efforts.has(String(issue.effort))) {
      throw new Error(`Gemini response has an invalid effort in ${field} at index ${index}.`);
    }

    return issue as AuditIssue;
  });
}

function countSentences(summary: string) {
  return summary.split(/[.!?]+/).map((part) => part.trim()).filter(Boolean).length;
}

export function parseAuditResponse(content: string): AuditAnalysis {
  const jsonText = content.match(/\{[\s\S]*\}/)?.[0] ?? content;
  let value: unknown;

  try {
    value = JSON.parse(jsonText);
  } catch {
    throw new Error("Gemini did not return valid JSON for the audit.");
  }

  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("Gemini returned JSON that is not an object.");
  }

  const result = value as Record<string, unknown>;
  const breakdown = result.score_breakdown as Record<string, unknown> | undefined;
  const requiredScores = ["technical", "on_page", "content", "core_web_vitals", "schema"];
  const scoreIsValid = (score: unknown) => Number.isInteger(score) && Number(score) >= 0 && Number(score) <= 100;

  if (result.audit_version !== "v1.0") {
    throw new Error("Gemini response has an unsupported audit_version.");
  }
  if (!scoreIsValid(result.overall_score)) {
    throw new Error("Gemini response has an invalid overall_score.");
  }
  if (!breakdown || requiredScores.some((key) => !scoreIsValid(breakdown[key]))) {
    throw new Error("Gemini response is missing valid score_breakdown fields.");
  }

  const criticalIssues = parseIssueList(result.critical_issues, "critical_issues", 5);
  const importantIssues = parseIssueList(result.important_issues, "important_issues", 8);
  const quickWins = parseIssueList(result.quick_wins, "quick_wins", 5);
  const recommendations = parseIssueList(result.recommendations, "recommendations");

  recommendations.forEach((recommendation, index) => {
    const requiredFields = ["finding", "fix", "estimated_impact", "effort", "falsifiability_check"] as const;
    if (requiredFields.some((field) => typeof recommendation[field] !== "string" || !recommendation[field]?.trim())) {
      throw new Error(`Gemini recommendation ${index + 1} is missing a required field.`);
    }
    if (!priorities.has(String(recommendation.priority))) {
      throw new Error(`Gemini recommendation ${index + 1} has an invalid priority.`);
    }
    if (!categories.has(String(recommendation.category))) {
      throw new Error(`Gemini recommendation ${index + 1} has an invalid category.`);
    }
    if (!impacts.has(String(recommendation.estimated_impact))) {
      throw new Error(`Gemini recommendation ${index + 1} has an invalid estimated_impact.`);
    }
    if (!efforts.has(String(recommendation.effort))) {
      throw new Error(`Gemini recommendation ${index + 1} has an invalid effort.`);
    }
  });

  quickWins.forEach((quickWin, index) => {
    if (quickWin.effort !== "Hours") {
      throw new Error(`Gemini quick win ${index + 1} must have effort "Hours" (no more than two hours).`);
    }
  });

  if (typeof result.executive_summary !== "string" || countSentences(result.executive_summary) > 3) {
    throw new Error("Gemini response needs a plain-text executive_summary of no more than three sentences.");
  }

  return {
    audit_version: "v1.0",
    overall_score: result.overall_score as number,
    score_breakdown: breakdown as AuditAnalysis["score_breakdown"],
    critical_issues: criticalIssues,
    important_issues: importantIssues,
    quick_wins: quickWins,
    recommendations,
    executive_summary: result.executive_summary,
  };
}
