export const endpoints = [
  {
    id: "create-audit",
    method: "POST",
    path: "/graphql",
    purpose: "Run createAudit(input: AuditInput!) to validate and enqueue a background job.",
  },
  {
    id: "list-audits",
    method: "POST",
    path: "/graphql",
    purpose: "Run audits(limit: Int) to return the latest persisted audits.",
  },
  {
    id: "paginated-audit-list",
    method: "POST",
    path: "/graphql",
    purpose: "Run auditList(page, pageSize, search, status) for server-paginated audits, totals, and summary metrics. Page size is limited to 100.",
  },
  {
    id: "audit-status",
    method: "POST",
    path: "/graphql",
    purpose: "Run auditStatus(jobId: ID!) to return queue state, progress, result, and error.",
  },
  {
    id: "download-audit-report",
    method: "GET",
    path: "/api/audits/{jobId}/report",
    purpose: "Download the completed PDF; returns a not-ready response before completion.",
  },
  {
    id: "upload-profile-picture",
    method: "POST",
    path: "/api/profile-picture",
    purpose: "Upload an authenticated JPEG, PNG, or WebP profile image (raw file body, up to 5 MB) to private S3 storage.",
  },
  {
    id: "preview-audit",
    method: "POST",
    path: "/graphql",
    purpose: "Run auditPreview(input: AuditInput!) to execute a preview without queueing a job.",
  },
  {
    id: "queue-scheduled-audits",
    method: "GET",
    path: "/api/cron/audits",
    purpose: "Queue the configured monthly or demo audit targets; requires Authorization: Bearer CRON_SECRET.",
  },
];
