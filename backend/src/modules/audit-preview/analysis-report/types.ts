export type AuditPreviewInput = {
  url: string;
  businessType: string;
  city: string;
  state: string;
};

export type AuditSignals = {
  crawl: {
    requestedUrl?: string;
    status: number | null;
    finalUrl: string;
    title: string;
    metaDescription: string;
    headings: { h1: string[]; h2: string[] };
    links: string[];
    imagesMissingAlt: number;
    canonical: string | null;
    schema: unknown[];
    schemaValidation?: {
      validator: string;
      valid: boolean;
      itemCount: number;
      errors: string[];
      warnings: string[];
    };
    pages?: unknown[];
    siteSummary?: unknown;
    crawlErrors?: string[];
    robots: unknown;
    sitemaps: unknown[];
  };
  pagespeed: unknown;
  googleSearchConsole: unknown;
  keywordRankings: unknown;
};

export type AuditIssue = {
  issue?: string;
  finding?: string;
  priority?: string;
  category?: string;
  fix?: string;
  estimated_impact?: string;
  effort?: string;
  falsifiability_check?: string;
};

export type AuditAnalysis = {
  audit_version: string;
  overall_score: number;
  score_breakdown: {
    technical: number;
    on_page: number;
    content: number;
    core_web_vitals: number;
    schema: number;
  };
  critical_issues: AuditIssue[];
  important_issues: AuditIssue[];
  quick_wins: AuditIssue[];
  recommendations: AuditIssue[];
  executive_summary: string;
};
