import { Activity, Database, Gauge, Play, Workflow } from "lucide-react";

export const workflow = [
  {
    number: "01",
    title: "Submit a website",
    description:
      "Enter a full website URL and the business type, city, and state. The form validates the required fields before it sends the request.",
    detail: "Client dashboard or Admin portal",
    icon: Play,
  },
  {
    number: "02",
    title: "Validate and enqueue",
    description:
      "The API checks the request and adds an SEO audit job to the BullMQ queue in Redis. The client receives a job ID without waiting for the analysis to finish.",
    detail: "GraphQL createAudit mutation → BullMQ → Redis",
    icon: Workflow,
  },
  {
    number: "03",
    title: "Process the audit",
    description:
      "The separate worker records the job in PostgreSQL, respects robots.txt, crawls a bounded set of same-origin pages from sitemaps and links, validates JSON-LD structure, queries configured provider integrations, and requests a prioritized analysis.",
    detail: "backend/modules/worker/audit-worker.ts",
    icon: Activity,
  },
  {
    number: "04",
    title: "Save the report",
    description:
      "The worker stores the score and analysis, generates a PDF, saves it to the configured report storage, and marks the database record complete. Failures are recorded against the audit.",
    detail: "Prisma + PDF + local storage or private S3",
    icon: Database,
  },
  {
    number: "05",
    title: "Follow progress and review",
    description:
      "The dashboards query job status while work is active. The client can view progress and its report; admins can search, filter, page through jobs, and open audit details. cron-job.org can queue configured targets through the protected scheduled-audit endpoint.",
    detail: "Apollo Client + GraphQL queries",
    icon: Gauge,
  },
];
