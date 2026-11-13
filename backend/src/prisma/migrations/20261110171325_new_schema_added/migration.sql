-- CreateEnum
CREATE TYPE "AuditStatus" AS ENUM ('queued', 'processing', 'completed', 'failed');

-- CreateTable
CREATE TABLE "Audit" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "businessType" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "status" "AuditStatus" NOT NULL DEFAULT 'queued',
    "overallScore" INTEGER,
    "dataSources" JSONB,
    "signals" JSONB,
    "analysis" JSONB,
    "note" TEXT,
    "reportPath" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Audit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Audit_jobId_key" ON "Audit"("jobId");

-- CreateIndex
CREATE INDEX "Audit_status_createdAt_idx" ON "Audit"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Audit_url_createdAt_idx" ON "Audit"("url", "createdAt");
