import { emitAuditCompletedWebhook } from "../../shared/webhooks/audit-completed";

type AuditCompletedNotification = {
  jobId: string;
  url: string;
  overallScore: number;
};

export async function notifyAuditCompleted(audit: AuditCompletedNotification) {
  const reportDownloadPath = `/api/audits/${encodeURIComponent(audit.jobId)}/report`;
  const event = {
    id: `${audit.jobId}:audit.completed`,
    type: "audit.completed" as const,
    createdAt: new Date().toISOString(),
    data: {
      jobId: audit.jobId,
      url: audit.url,
      overallScore: audit.overallScore,
      reportDownloadPath,
    },
  };

  try {
    const delivery = await emitAuditCompletedWebhook(event);
    if (delivery.status === "not_configured") {
      console.info("Audit completion webhook was not sent because it is not configured.");
    }
  } catch (error) {
    console.error("Audit completion webhook delivery failed:", error);
  }
}
