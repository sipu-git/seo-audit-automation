"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { AppShell } from "@/src/shared/layout/app-shell";
import { AdminAuditDetails } from "@/src/features/admin/components/widgets/admin-audit-details";
import { AuditForm } from "@/src/features/audits/components/audit-form";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";
import { Card } from "@/components/ui/card";
import {
  AdminAuditTable,
  ADMIN_AUDIT_PAGE_SIZE,
} from "@/src/features/admin/components/widgets/admin-audit-table";
import {
  AdminMetrics,
  AdminQueueStatus,
} from "@/src/features/admin/components/widgets/admin-dashboard-overview";
import {
  AUDITS_QUERY,
  type AuditsQueryData,
  type AuditsQueryVariables,
} from "@/src/features/audits/api/audit-queries";
import type { AuditRow } from "@/src/features/audits/types/audit-types";

const EMPTY_AUDITS: AuditRow[] = [];

export default function AdminDashboardPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pendingJobIds, setPendingJobIds] = useState<string[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const auditsQuery = useQuery<AuditsQueryData, AuditsQueryVariables>(
    AUDITS_QUERY,
    {
      variables: { limit: 100 },
      fetchPolicy: "cache-and-network",
      notifyOnNetworkStatusChange: true,
    },
  );
  const { refetch, startPolling, stopPolling, observable } = auditsQuery;
  const audits = auditsQuery.data?.audits ?? EMPTY_AUDITS;
  const hasActiveAudits =
    pendingJobIds.length > 0 ||
    audits.some((audit) => ["QUEUED", "PROCESSING"].includes(audit.status));
  const selected =
    audits.find((audit) => audit.jobId === selectedJobId) ?? null;
  const error = auditsQuery.error?.message ?? "";

  useEffect(() => {
    if (hasActiveAudits) startPolling(10_000);
    else stopPolling();
    return () => stopPolling();
  }, [hasActiveAudits, startPolling, stopPolling]);

  useEffect(() => {
    const subscription = observable.subscribe(({ data }) => {
      if (!data) return;
      setLastUpdated(new Date());
      const currentAudits = data.audits ?? [];
      setPendingJobIds((current) =>
        current.filter((jobId) => {
          const audit = currentAudits.find((row) => row.jobId === jobId);
            return (
              !audit ||
              (audit.status !== "COMPLETED" && audit.status !== "FAILED")
            );
        }),
      );
    });
    return () => subscription.unsubscribe();
  }, [observable]);

  const filtered = useMemo(
    () =>
      audits.filter((audit) => {
        const matchesFilter = filter === "ALL" || audit.status === filter;
        const term = search.trim().toLowerCase();
        const matchesSearch =
          !term ||
          [audit.url, audit.city, audit.businessType, audit.jobId].some(
            (value) => value.toLowerCase().includes(term),
          );
        return matchesFilter && matchesSearch;
      }),
    [audits, filter, search],
  );
  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / ADMIN_AUDIT_PAGE_SIZE),
  );
  const visiblePage = Math.min(page, totalPages);

  const stats = useMemo(() => {
    const scoredAudits = audits.filter((row) => row.overallScore !== null);
    return {
      total: audits.length,
      active: audits.filter((row) =>
        ["QUEUED", "PROCESSING"].includes(row.status),
      ).length,
      completed: audits.filter((row) => row.status === "COMPLETED").length,
      failed: audits.filter((row) => row.status === "FAILED").length,
      average: scoredAudits.length
        ? Math.round(
            scoredAudits.reduce(
              (sum, row) => sum + (row.overallScore ?? 0),
              0,
            ) / scoredAudits.length,
          )
        : null,
    };
  }, [audits]);

  function queued(jobId: string) {
    setShowForm(false);
    setPendingJobIds((current) =>
      current.includes(jobId) ? current : [...current, jobId],
    );
    void refetch();
  }

  return (
    <AppShell
      eyebrow="INTERNAL OPERATIONS"
      title="Audit command center"
      description="Monitor queued jobs, review completed reports, and initiate manual audits."
      action={
        <Button
          className="h-10 rounded-[9px] px-[15px] text-xs font-bold shadow-[0_5px_12px_#118d681f] transition-transform hover:-translate-y-px"
          onClick={() => setShowForm((value) => !value)}
        >
          <Icon className="size-4" name={showForm ? "close" : "plus"} />
          {showForm ? "Close form" : "New audit"}
        </Button>
      }
    >
      {showForm && (
        <Card className="grid grid-cols-[minmax(200px,.75fr)_minmax(0,1.25fr)] items-start gap-6 rounded-[14px] border-[var(--line)] bg-[var(--surface)] px-6 py-[22px] shadow-sm max-[780px]:grid-cols-1">
          <div>
            <p className="mb-2 text-[9px] font-bold tracking-[1.35px] text-[var(--muted)]">MANUAL TRIGGER</p>
            <h2>Queue a website audit</h2>
            <p>Start a BullMQ job and follow its progress in this portal.</p>
          </div>
          <AuditForm compact onQueued={queued} />
        </Card>
      )}

      <AdminQueueStatus
        error={error}
        refreshing={auditsQuery.loading}
        lastUpdated={lastUpdated}
        onRefresh={() => void refetch()}
      />
      <AdminMetrics
        total={stats.total}
        active={stats.active}
        completed={stats.completed}
        average={stats.average}
      />
      <AdminAuditTable
        audits={filtered}
        allAuditCount={audits.length}
        loading={auditsQuery.loading}
        error={error}
        search={search}
        filter={filter}
        page={visiblePage}
        failedCount={stats.failed}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onFilterChange={(value) => {
          setFilter(value);
          setPage(1);
        }}
        onPageChange={setPage}
        onRetry={() => void refetch()}
        onSelect={(audit) => setSelectedJobId(audit.jobId)}
      />
      <AdminAuditDetails
        audit={selected}
        onClose={() => setSelectedJobId(null)}
      />
    </AppShell>
  );
}
