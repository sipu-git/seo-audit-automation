import { Job, UnrecoverableError } from "bullmq";
import { getAuditPreview } from "../../audit-preview/services/audit-preview.service";
import {
  markAuditCompleted,
  markAuditFailed,
  markAuditProcessing,
  saveAuditAnalysis,
} from "../../audits/services/audits.service";
import type { AuditJobInput } from "../../audits/validations/audit-input.validation";
import { RetryableGeminiError } from "../../../shared/integrations/ai/index.js";
import { notifyAuditCompleted } from "../../notifications/audit-completed.js";
import { toJson } from "../../../shared/json.js";

export async function processAuditJob(job: Job<AuditJobInput>) {
  if (!job.id) throw new Error("Audit job is missing its BullMQ job ID.");

  const jobId = job.id;
  const input = job.data;
  try {
    await markAuditProcessing(jobId, input);
    await job.updateProgress(10);

    const result = await getAuditPreview(input, (progress) => job.updateProgress(progress));

    await saveAuditAnalysis(jobId, {
      overallScore: result.analysis.overall_score,
      dataSources: toJson(result.dataSources),
      signals: toJson(result.signals),
      analysis: toJson(result.analysis),
      note: result.note,
    });

    await job.updateProgress(96);
    await markAuditCompleted(jobId);
    await notifyAuditCompleted({
      jobId,
      url: input.url,
      overallScore: result.analysis.overall_score,
    });

    await job.updateProgress(100);
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Audit failed.";
    const maxAttempts = job.opts.attempts ?? 1;
    const attemptNumber = job.attemptsMade + 1;
    const retryPending = error instanceof RetryableGeminiError && attemptNumber < maxAttempts;

    console.error("Audit processing failed:", {
      jobId,
      attemptNumber,
      maxAttempts,
      retryPending,
      message,
      name: error instanceof Error ? error.name : "UnknownError",
      stack: error instanceof Error ? error.stack : undefined,
    });

    await markAuditFailed(jobId, message, retryPending);
    if (!retryPending) throw new UnrecoverableError(message);
    throw error;
  }
}
