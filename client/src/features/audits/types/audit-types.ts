export type AuditInput = {
  url: string;
  businessType: string;
  city: string;
  state: string;
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
  audit_version?: string;
  overall_score: number;
  score_breakdown?: Record<string, number>;
  critical_issues?: AuditIssue[];
  important_issues?: AuditIssue[];
  quick_wins?: AuditIssue[];
  recommendations?: AuditIssue[];
  executive_summary?: string;
};

export type AuditResult = {
  status?: string;
  dataSources?: Record<string, string>;
  business?: AuditInput;
  signals?: Record<string, unknown> & {
    crawl?: { finalUrl?: string };
  };
  analysis?: AuditAnalysis;
  note?: string;
};

export type AuditJobStatus = {
  jobId: string;
  state: "waiting" | "active" | "completed" | "failed" | string;
  progress: number | { percent?: number };
  result: AuditResult | null;
  error: string | null;
};

export type AuditRow = {
  id: string;
  jobId: string;
  url: string;
  businessType: string;
  city: string;
  state: string;
  status: string;
  progress: number;
  overallScore: number | null;
  dataSources: Record<string, string> | null;
  signals: (Record<string, unknown> & {
    crawl?: { finalUrl?: string };
  }) | null;
  analysis: AuditAnalysis | null;
  note: string | null;
  reportAvailable: boolean;
  error: string | null;
  createdAt: string;
  completedAt: string | null;
};
