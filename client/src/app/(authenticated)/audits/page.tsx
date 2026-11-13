"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { AppShell } from "@/src/shared/layout/app-shell";
import {
  AUDIT_LIST_QUERY,
  type AuditListQueryData,
  type AuditListQueryVariables,
} from "@/src/features/audits/api/audit-queries";
import {
  DELETE_AUDIT_MUTATION,
  type DeleteAuditMutationData,
  type DeleteAuditMutationVariables,
} from "@/src/features/audits/api/audit-mutations";
import type { AuditRow } from "@/src/features/audits/types/audit-types";
import {
  AuditLoadError,
  AuditRefreshBanner,
} from "@/features/audits/components/audit-refresh-banner";
import { AuditResultsPanel } from "@/features/audits/components/audit-results-panel";
import { AuditSummaryCards } from "@/features/audits/components/audit-summary-cards";
import { AuditDeleteDialog } from "@/features/audits/components/audit-delete-dialog";
import { ClientAuditDetails } from "@/features/audits/components/client-audit-details";

const EMPTY_AUDITS: AuditRow[] = [];
const PAGE_SIZE = 4;

export default function MyAuditsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [selectedAudit, setSelectedAudit] = useState<AuditRow | null>(null);
  const [auditToDelete, setAuditToDelete] = useState<AuditRow | null>(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [deleteAudit, { loading: deleting }] = useMutation<
    DeleteAuditMutationData,
    DeleteAuditMutationVariables
  >(DELETE_AUDIT_MUTATION);

  const auditsQuery = useQuery<AuditListQueryData, AuditListQueryVariables>(AUDIT_LIST_QUERY, {
    variables: { page, pageSize: PAGE_SIZE, search, status },
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });
  const { refetch, observable } = auditsQuery;
  const auditList = auditsQuery.data?.auditList;
  const audits = auditList?.items ?? EMPTY_AUDITS;
  const summary = auditList?.summary;
  const totalCount = auditList?.totalCount ?? 0;
  const totalPages = Math.max(1, auditList?.totalPages ?? 1);
  const visiblePage = auditList?.page ?? Math.min(page, totalPages);
  const firstVisible = totalCount ? (visiblePage - 1) * PAGE_SIZE + 1 : 0;
  const lastVisible = Math.min(visiblePage * PAGE_SIZE, totalCount);
  const error = auditsQuery.error?.message ?? "";

  useEffect(() => {
    const subscription = observable.subscribe(({ data }) => {
      if (data?.auditList) setLastUpdated(new Date());
    });
    return () => subscription.unsubscribe();
  }, [observable]);

  useEffect(() => {
    if (!auditsQuery.loading && auditList && auditList.page !== page) {
      setPage(auditList.page);
    }
  }, [auditList, auditsQuery.loading, page]);

  function changeSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function changeStatus(value: string) {
    setStatus(value);
    setPage(1);
  }

  function requestDelete(audit: AuditRow) {
    setDeleteErrorMessage("");
    setAuditToDelete(audit);
  }

  async function confirmDelete() {
    if (!auditToDelete) return;

    try {
      const { data } = await deleteAudit({ variables: { jobId: auditToDelete.jobId } });
      if (!data?.deleteAudit) {
        setDeleteErrorMessage("The audit could not be deleted. Refresh and try again.");
        return;
      }

      if (selectedAudit?.jobId === auditToDelete.jobId) setSelectedAudit(null);
      setAuditToDelete(null);
      await refetch();
    } catch (error) {
      setDeleteErrorMessage(error instanceof Error ? error.message : "The audit could not be deleted.");
    }
  }

  return (
    <AppShell
      eyebrow="MY WORKSPACE"
      title="Your website audits"
      description="Review every recent audit, follow active work, and reopen completed SEO reports."
    >
      <AuditSummaryCards
        total={summary?.total ?? 0}
        completed={summary?.completed ?? 0}
        active={summary?.active ?? 0}
        failed={summary?.failed ?? 0}
        averageScore={summary?.averageScore == null ? null : Math.round(summary.averageScore)}
      />
      <AuditRefreshBanner
        activeCount={summary?.active ?? 0}
        loading={auditsQuery.loading}
        lastUpdated={lastUpdated}
        onRefresh={() => void refetch()}
      />
      <AuditLoadError message={error} onRetry={() => void refetch()} />
      <AuditResultsPanel
        audits={audits}
        totalAudits={summary?.total ?? 0}
        totalCount={totalCount}
        loading={auditsQuery.loading}
        error={Boolean(error)}
        search={search}
        status={status}
        firstVisible={firstVisible}
        lastVisible={lastVisible}
        page={visiblePage}
        totalPages={totalPages}
        onSearchChange={changeSearch}
        onStatusChange={changeStatus}
        onPageChange={setPage}
        onSelect={setSelectedAudit}
        onDelete={requestDelete}
        deletingJobId={deleting ? auditToDelete?.jobId ?? null : null}
      />
      <ClientAuditDetails audit={selectedAudit} onClose={() => setSelectedAudit(null)} />
      <AuditDeleteDialog
        audit={auditToDelete}
        deleting={deleting}
        error={deleteErrorMessage}
        onCancel={() => {
          setAuditToDelete(null);
          setDeleteErrorMessage("");
        }}
        onConfirm={() => void confirmDelete()}
      />
    </AppShell>
  );
}
