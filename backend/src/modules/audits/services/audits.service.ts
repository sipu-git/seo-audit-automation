import type { Prisma } from "../../../generated/prisma/client";
import { getAuditQueue } from "../../../shared/queue/audit-queue";
import { prisma } from "../../../db/client";
import type { ValidatedGetAuditListQuery } from "../validations/audits.validation";
import type { AuditJobInput } from "../validations/audit-input.validation";

type AuditRecord = Awaited<ReturnType<typeof prisma.audit.findMany>>[number];

function mapAudit(row: AuditRecord) {
  return {
    id: row.id,
    jobId: row.jobId,
    url: row.url,
    businessType: row.businessType,
    city: row.city,
    state: row.state,
    status: row.status,
    overallScore: row.overallScore,
    dataSources: row.dataSources,
    signals: row.signals,
    analysis: row.analysis,
    note: row.note,
    reportPath: row.reportPath,
    error: row.error,
    createdAt: row.createdAt,
    completedAt: row.completedAt,
  };
}

async function listAudits(take: number, ownerId?: string) {
  const rows = await prisma.audit.findMany({
    ...(ownerId ? { where: { created_by: ownerId } } : {}),
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take,
  });
  return rows.map(mapAudit);
}

async function addAuditProgress(audits: ReturnType<typeof mapAudit>[]) {
  return Promise.all(audits.map(async (audit) => {
    const { reportPath, ...publicAudit } = audit;
    const reportAvailable = Boolean(reportPath);
    if (audit.status === "COMPLETED") return { ...publicAudit, reportAvailable, progress: 100 };
    if (audit.status === "FAILED") return { ...publicAudit, reportAvailable, progress: 0 };
    try {
      const job = await findAuditJob(audit.jobId);
      const progress = typeof job?.progress === "number"
        ? job.progress
        : typeof job?.progress === "object" && job.progress !== null &&
          "percent" in job.progress && typeof job.progress.percent === "number"
          ? job.progress.percent
          : 0;
      return { ...publicAudit, reportAvailable, progress };
    } catch {
      return { ...publicAudit, reportAvailable, progress: 0 };
    }
  }));
}

function enqueueAudit(input: AuditJobInput, jobId?: string) {
  return getAuditQueue().add("site-audit", input, {
    ...(jobId ? { jobId } : {}),
    attempts: 3,
    backoff: { type: "exponential", delay: 10_000 },
    removeOnComplete: 100,
    removeOnFail: 500,
  });
}

function findAuditJob(jobId: string) {
  return getAuditQueue().getJob(jobId);
}

export async function getAudits(limit: number, ownerId?: string) {
  return addAuditProgress(await listAudits(limit, ownerId));
}

export async function getAuditList(input: ValidatedGetAuditListQuery, ownerId?: string) {
  const ownerWhere: Prisma.AuditWhereInput = ownerId ? { created_by: ownerId } : {};
  const search = input.search.trim();
  const where: Prisma.AuditWhereInput = {
    ...ownerWhere,
    ...(input.status !== "ALL" ? { status: input.status } : {}),
    ...(search ? {
      OR: [
        { url: { contains: search, mode: "insensitive" } },
        { businessType: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { state: { contains: search, mode: "insensitive" } },
        { jobId: { contains: search, mode: "insensitive" } },
      ],
    } : {}),
  };

  const [totalCount, statusCounts, scoreAggregate] = await Promise.all([
    prisma.audit.count({ where }),
    prisma.audit.groupBy({
      by: ["status"],
      where: ownerWhere,
      _count: { _all: true },
    }),
    prisma.audit.aggregate({
      where: ownerWhere,
      _avg: { overallScore: true },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / input.pageSize));
  const page = Math.min(input.page, totalPages);
  const rows = await prisma.audit.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: (page - 1) * input.pageSize,
    take: input.pageSize,
  });
  const counts = new Map(statusCounts.map(({ status, _count }) => [status, _count._all] as const));

  return {
    items: await addAuditProgress(rows.map(mapAudit)),
    totalCount,
    page,
    pageSize: input.pageSize,
    totalPages,
    summary: {
      total: [...counts.values()].reduce((sum, count) => sum + count, 0),
      completed: counts.get("COMPLETED") ?? 0,
      active: (counts.get("QUEUED") ?? 0) + (counts.get("PROCESSING") ?? 0),
      failed: counts.get("FAILED") ?? 0,
      averageScore: scoreAggregate._avg.overallScore,
    },
  };
}

export async function createAudit(input: AuditJobInput, ownerId: string) {
  const job = await enqueueAudit(input);
  await prisma.audit.upsert({
    where: { jobId: job.id! },
    create: { jobId: job.id!, ...input, created_by: ownerId, status: "QUEUED" },
    update: { created_by: ownerId },
    select: { id: true },
  });
  return job;
}

export async function getAuditJobStatus(jobId: string) {
  const job = await findAuditJob(jobId);
  if (!job) return null;
  return {
    jobId: job.id,
    state: await job.getState(),
    progress: typeof job.progress === "number"
      ? job.progress
      : typeof job.progress === "object" && job.progress !== null &&
        "percent" in job.progress && typeof job.progress.percent === "number"
        ? job.progress.percent
        : 0,
    result: job.returnvalue ?? null,
    error: job.failedReason || null,
  };
}

export async function findAuditReport(jobId: string) {
  const audit = await prisma.audit.findUnique({ where: { jobId } });
  if (!audit) return null;

  return {
    jobId: audit.jobId,
    status: audit.status,
    url: audit.url,
    businessType: audit.businessType,
    city: audit.city,
    state: audit.state,
    analysis: audit.analysis,
    dataSources: audit.dataSources,
    note: audit.note,
    createdAt: audit.createdAt,
    reportPath: audit.reportPath,
  };
}

export async function updateAuditReportPath(jobId: string, reportPath: string) {
  return prisma.audit.update({
    where: { jobId },
    data: { reportPath },
    select: { jobId: true },
  });
}

export async function markAuditProcessing(jobId: string, input: AuditJobInput) {
  const updated = await prisma.audit.updateMany({
    where: { jobId },
    data: {
      status: "PROCESSING",
      error: null,
      completedAt: null,
    },
  });

  if (updated.count > 0) {
    return prisma.audit.findUniqueOrThrow({
      where: { jobId },
      select: { createdAt: true },
    });
  }

  // Scheduled audits don't have a row until their worker starts processing.
  return prisma.audit.create({
    data: {
      jobId,
      url: input.url,
      businessType: input.businessType,
      city: input.city,
      state: input.state,
      status: "PROCESSING",
    },
    select: { createdAt: true },
  });
}

export async function saveAuditAnalysis(
  jobId: string,
  result: {
    overallScore: number;
    dataSources: Prisma.InputJsonValue;
    signals: Prisma.InputJsonValue;
    analysis: Prisma.InputJsonValue;
    note: string;
  },
) {
  return prisma.audit.update({
    where: { jobId },
    data: {
      overallScore: result.overallScore,
      dataSources: result.dataSources,
      signals: result.signals,
      analysis: result.analysis,
      note: result.note,
      error: null,
      reportPath: null,
    },
    select: { jobId: true },
  });
}

export async function markAuditCompleted(jobId: string, reportPath: string) {
  return prisma.audit.update({
    where: { jobId },
    data: {
      status: "COMPLETED",
      reportPath,
      error: null,
      completedAt: new Date(),
    },
    select: { jobId: true },
  });
}

export async function markAuditFailed(jobId: string, errorMessage: string, retryPending: boolean) {
  const update = retryPending
    ? { status: "PROCESSING" as const, error: null }
    : { status: "FAILED" as const, error: errorMessage };
  return prisma.audit.update({
    where: { jobId },
    data: update,
    select: { jobId: true },
  });

}

export async function deleteAudit(jobId: string, ownerId: string) {
  const deleted = await prisma.audit.deleteMany({
    where: { jobId, created_by: ownerId },
  });
  return deleted.count > 0;
}