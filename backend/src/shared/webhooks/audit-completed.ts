export type AuditCompletedWebhookEvent = {
  id: string;
  type: "audit.completed";
  createdAt: string;
  data: {
    jobId: string;
    url: string;
    overallScore: number;
    reportDownloadPath: string;
  };
};

export async function emitAuditCompletedWebhook(event: AuditCompletedWebhookEvent) {
  const configuredUrl = process.env.AUDIT_COMPLETED_WEBHOOK_URL?.trim();

  if (!configuredUrl) {
    return { status: "not_configured" as const };
  }

  const endpoint = new URL(configuredUrl);
  if (endpoint.protocol !== "https:" && endpoint.hostname !== "localhost" && endpoint.hostname !== "127.0.0.1") {
    throw new Error("AUDIT_COMPLETED_WEBHOOK_URL must use HTTPS (HTTP is allowed only for localhost).");
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Audit-Event": event.type },
    body: JSON.stringify(event),
    signal: AbortSignal.timeout(5_000),
  });

  if (!response.ok) {
    throw new Error(`Audit completion webhook returned HTTP ${response.status}.`);
  }

  return { status: "sent" as const, statusCode: response.status };
}
