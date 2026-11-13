import type { AuditPreviewInput, AuditAnalysis } from "../llm-integration/types";

export type AuditPdfData = {
  jobId: string;
  createdAt: Date | string;
  business: AuditPreviewInput;
  analysis: AuditAnalysis;
  dataSources?: Record<string, string>;
  note?: string | null;
};
