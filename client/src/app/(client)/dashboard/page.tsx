"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { AppShell } from "@/src/shared/layout/app-shell";
import { AuditForm } from "@/src/features/audits/components/audit-form";
import type { AuditRow } from "@/src/features/audits/types/audit-types";
import { ClientAuditHistory } from "@/features/audits/components/client-audit-history";
import {
  ClientMetrics,
  ClientWelcome,
} from "@/src/features/client-dashboard/components/widgets/client-dashboard-overview";
import { ClientSelectedAudit } from "@/features/audits/components/client-selected-audit";
import {
  AUDITS_QUERY,
  type AuditsQueryData,
  type AuditsQueryVariables,
} from "@/src/features/audits/api/audit-queries";

const EMPTY_AUDITS: AuditRow[] = [];

export default function ClientDashboardPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const auditsQuery = useQuery<AuditsQueryData, AuditsQueryVariables>(
    AUDITS_QUERY,
    {
      variables: { limit: 100 },
      fetchPolicy: "cache-first",
      notifyOnNetworkStatusChange: true,
    },
  );
  const { refetch } = auditsQuery;
  const audits = auditsQuery.data?.audits ?? EMPTY_AUDITS;

  function queued(jobId: string) {
    setSelectedId(jobId);
  }

  const selected = selectedId
    ? audits.find((audit) => audit.jobId === selectedId)
    : audits[0];
  const activeCount = audits.filter((audit) =>
    ["QUEUED", "PROCESSING"].includes(audit.status),
  ).length;
  const completedCount = audits.filter((audit) => audit.status === "COMPLETED").length;
  const error = auditsQuery.error?.message ?? "";

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
      {selected && <ClientSelectedAudit audit={selected} />}
    </AppShell>
  );
}
