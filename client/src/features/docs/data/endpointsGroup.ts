export const environmentGroups = [
  {
    title: "Frontend development",
    values: [
      ["BACKEND_API_URL", "Local Next.js rewrite target for the backend API; defaults to http://localhost:4000."],
    ],
  },
  {
    title: "Core services",
    values: [
      ["DATABASE_URL", "PostgreSQL connection string used by Prisma Client."],
      ["DIRECT_URL", "Direct PostgreSQL connection string used by Prisma Migrate."],
      ["REDIS_URL", "Redis connection used by BullMQ and the worker."],
      ["GEMINI_API_KEY", "Server-side Google Gemini API key required for audit analysis."],
      ["GEMINI_MODEL_ID", "Optional Gemini model override; defaults to gemini-3.8-flash."],
      ["CRON_SECRET", "Bearer secret required by the scheduled audit endpoint."],
      ["CRON_AUDIT_INTERVAL", "Deduplication cadence: monthly (default), daily, hourly, 5m, or 2m."],
      ["SCHEDULED_AUDIT_TARGETS", "JSON array of up to 30 scheduled audit inputs."],
      ["CRAWL_MAX_PAGES", "Maximum pages per site audit; defaults to 8 and is capped at 25."],
    ],
  },
  {
    title: "PDF storage and optional integrations",
    values: [
      ["AUDIT_REPORT_STORAGE", "Choose local or s3; auto-selects based on S3 configuration if omitted."],
      ["AUDIT_REPORTS_DIR", "Optional local directory for generated PDFs."],
      ["AWS_REGION / AWS_S3_BUCKET", "S3 location when private object storage is used."],
      ["AWS credentials or IAM role", "Server/worker identity used to access S3. Never expose credentials in client code."],
      ["AUDIT_COMPLETED_WEBHOOK_URL", "Optional HTTPS endpoint for completion events."],
    ],
  },
];
