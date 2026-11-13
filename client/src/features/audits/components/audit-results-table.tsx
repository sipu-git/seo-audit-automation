import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AuditEmptyStateRow } from "@/features/audits/components/audit-empty-state-row";
import { AuditResultRow } from "@/features/audits/components/audit-result-row";
import type { AuditRow } from "@/src/features/audits/types/audit-types";

export function AuditResultsTable({
  audits,
  totalCount,
  hasAudits,
  loading,
  error,
  onSelect,
  onDelete,
  deletingJobId,
}: {
  audits: AuditRow[];
  totalCount: number;
  hasAudits: boolean;
  loading: boolean;
  error: boolean;
  onSelect: (audit: AuditRow) => void;
  onDelete: (audit: AuditRow) => void;
  deletingJobId: string | null;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="min-w-[220px]">Website</TableHead>
          <TableHead className="min-w-[180px]">Business / location</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>SEO score</TableHead>
          <TableHead className="min-w-[150px]">Submitted</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {audits.length === 0
          ? <AuditEmptyStateRow loading={loading} error={error} hasAudits={hasAudits} />
          : audits.map((audit) => (
            <AuditResultRow
              key={audit.jobId}
              audit={audit}
              onSelect={onSelect}
              onDelete={onDelete}
              deleting={deletingJobId === audit.jobId}
            />
          ))}
      </TableBody>
    </Table>
  );
}
