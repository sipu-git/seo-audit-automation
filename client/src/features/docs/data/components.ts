export const components = [
  {
    area: "Pages and navigation",
    paths: "src/app/page.tsx · src/app/admin/page.tsx · src/app/docs/page.tsx",
    responsibility:
      "Map the client, admin, and guide URLs to their page components. AppShell provides the shared sidebar, page heading, breadcrumb, and footer.",
  },
  {
    area: "Dashboard UI",
    paths: "src/features/{client-dashboard,admin,audits}/components/",
    responsibility:
      "Compose the client and admin dashboards from forms, metrics, history/table, selected-report, and detail-sheet components. Shared dashboard widgets keep metrics and status badges consistent.",
  },
  {
    area: "Client data and caching",
    paths: "src/features/audits/api/ · src/features/audits/types/",
    responsibility:
      "Keep GraphQL operations and audit response types with the audits feature. Dashboard pages reuse these operations and poll while audits are active.",
  },
  {
    area: "HTTP API",
    paths: "backend/modules/api/routes/ · backend/modules/api/services/",
    responsibility:
      "Validate submitted audit input, enqueue jobs, list stored audits, return queue status, generate an optional synchronous preview, and deliver PDF reports. Vercel routes /api requests to the backend service.",
  },
  {
    area: "Queue and worker",
    paths: "backend/src/lib/audit-queue.ts · backend/modules/worker/audit-worker.ts",
    responsibility:
      "Share the BullMQ queue definition between web/API and worker. The worker runs the crawl and analysis, updates job progress, persists outcomes, and triggers completion notifications.",
  },
  {
    area: "Crawl and analysis",
    paths: "backend/src/lib/crawler/ · backend/src/lib/ai/nemotron/ · backend/src/mocks/",
    responsibility:
      "Safely fetch public HTTP/S pages, respect robots rules, discover a bounded set of same-origin pages from sitemap and links, structurally validate JSON-LD, query configured provider integrations, and report provider availability.",
  },
  {
    area: "Persistence",
    paths: "backend/src/prisma/ · backend/src/db/client.ts",
    responsibility:
      "Version the PostgreSQL schema with Prisma migrations and access audit records through Prisma Client.",
  },
  {
    area: "PDF and notifications",
    paths: "backend/src/lib/reports/ · backend/src/lib/storage/ · backend/src/lib/notifications/ · backend/src/lib/webhooks/",
    responsibility:
      "Render reports as PDFs, store and serve reports from local development storage or private S3, and deliver completion messages/webhook events (mock delivery by default).",
  },
];
