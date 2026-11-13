import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuditResultsTable } from "@/features/audits/components/audit-results-table";
import { AuditResultsToolbar } from "@/features/audits/components/audit-results-toolbar";
import { AuditTablePagination } from "@/features/audits/components/audit-table-pagination";
import type { AuditRow } from "@/src/features/audits/types/audit-types";
import { cn } from "@/src/shared/lib/utils";

export function AuditResultsPanel({
  audits,
  totalAudits,
  totalCount,
  loading,
  error,
  search,
  status,
  firstVisible,
  lastVisible,
  page,
  totalPages,
  onSearchChange,
  onStatusChange,
  onPageChange,
  onSelect,
  onDelete,
  deletingJobId,
}: {
  audits: AuditRow[];
  totalAudits: number;
  totalCount: number;
  loading: boolean;
  error: boolean;
  search: string;
  status: string;
  firstVisible: number;
  lastVisible: number;
  page: number;
  totalPages: number;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onSelect: (audit: AuditRow) => void;
  onDelete: (audit: AuditRow) => void;
  deletingJobId: string | null;
}) {
  return (
    <Card id="audit-results" className="overflow-hidden border-[var(--line)] bg-[var(--surface)] shadow-sm">
      <CardHeader className="gap-4 border-b border-[var(--line)] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-lg text-[var(--ink)]">Audit results</CardTitle>
          <CardDescription className="mt-1">Search your websites or filter by audit status.</CardDescription>
        </div>
        <Badge variant="outline" className="w-fit">{totalAudits} total</Badge>
      </CardHeader>
      <CardContent className="space-y-4 p-5">
        <AuditResultsToolbar
          search={search}
          status={status}
          onSearchChange={onSearchChange}
          onStatusChange={onStatusChange}
        />
        <AuditResultsTable
          audits={audits}
          totalCount={totalCount}
          hasAudits={totalAudits > 0}
          loading={loading}
          error={error}
          onSelect={onSelect}
          onDelete={onDelete}
          deletingJobId={deletingJobId}
        />
        <div className={cn(
          "flex flex-col gap-3 border-t border-[var(--line)] pt-4",
          "sm:flex-row sm:items-center sm:justify-between",
        )}>
          <p className="text-xs text-[var(--muted)]">
            Showing {firstVisible}–{lastVisible} of {totalCount} results
          </p>
          {totalCount > 0 && (
            <AuditTablePagination
              page={page}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
