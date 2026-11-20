"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client/react";
import dynamic from "next/dynamic";
import type { AuditRow } from "@/src/features/audits/types/audit-types";
import { ClientSelectedAudit } from "@/features/audits/components/client-selected-audit";
import { AuditDetailsLoadingSkeleton } from "@/features/audits/components/audit-details-loading-skeleton";
import {AUDITS_QUERY,type AuditsQueryData,type AuditsQueryVariables} from "@/src/features/audits/api/audit-queries";

const EMPTY_AUDITS: AuditRow[] = [];
const AppShell = dynamic(() => import("@/src/shared/layout/app-shell").then((module) => module.AppShell));
const AuditForm = dynamic(() => import("@/src/features/audits/components/audit-form").then((module) => module.AuditForm),{
  loading: () => <AuditDetailsLoadingSkeleton />,
});
const ClientAuditHistory = dynamic(() => import("@/src/features/audits/components/client-audit-history").then((module) => module.ClientAuditHistory),{
  loading: () => <AuditDetailsLoadingSkeleton />,
});
const ClientMetrics = dynamic(() => import("@/src/features/client-dashboard/components/widgets/client-dashboard-overview").then((module) => module.ClientMetrics),{
  loading: () => <AuditDetailsLoadingSkeleton />,
});
const ClientWelcome = dynamic(() => import("@/src/features/client-dashboard/components/widgets/client-dashboard-overview").then((module) => module.ClientWelcome),{
  loading: () => <AuditDetailsLoadingSkeleton />,
});
const AuditDetailsDialog = dynamic(() => import("@/features/audits/components/audit-details-dialog").then((module) => module.AuditDetailsDialog),
  { loading: () => <AuditDetailsLoadingSkeleton /> },
);

export default function ClientDashboardPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reportAudit, setReportAudit] = useState<AuditRow | null>(null);
  const auditsQuery = useQuery<AuditsQueryData, AuditsQueryVariables>(
    AUDITS_QUERY,
    {
      variables: { limit: 100 },
      fetchPolicy: "cache-first",
      notifyOnNetworkStatusChange: true,
    },
  );
  const { refetch, startPolling, stopPolling } = auditsQuery;
  const audits = auditsQuery.data?.audits ?? EMPTY_AUDITS;

  function queued(jobId: string) {
    setSelectedId(jobId);
    void refetch();
  }

  const selected = selectedId
    ? audits.find((audit) => audit.jobId === selectedId)
    : audits[0];
  const activeCount = audits.filter((audit) =>
    ["QUEUED", "PROCESSING"].includes(audit.status),
  ).length;
  const completedCount = audits.filter((audit) => audit.status === "COMPLETED").length;
  const error = auditsQuery.error?.message ?? "";

  useEffect(() => {
    if (activeCount > 0) startPolling(10_000);
    else stopPolling();
    return () => stopPolling();
  }, [activeCount, startPolling, stopPolling]);

  return (
    <AppShell
      eyebrow="CLIENT WORKSPACE"
      title="Your SEO, in focus."
      description="Run a website audit and turn search signals into a clear plan for growth."
    >
      <ClientWelcome />
      <ClientMetrics
        total={audits.length}
        active={activeCount}
        completed={completedCount}
      />
      <div className="grid grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)] items-stretch gap-5 max-[780px]:grid-cols-1">
        <AuditForm onQueued={queued} />
        <ClientAuditHistory
          audits={audits}
          hydrated={!auditsQuery.loading}
          selectedJobId={selected?.jobId ?? null}
          onSelect={setSelectedId}
          error={error}
          refreshing={auditsQuery.loading}
          onRefresh={() => void refetch()}
        />
      </div>
      {selected && (
        <ClientSelectedAudit audit={selected} onViewReport={setReportAudit} />
      )}
      {reportAudit && (
        <AuditDetailsDialog audit={reportAudit} onClose={() => setReportAudit(null)} />
      )}
    </AppShell>
  );
}
