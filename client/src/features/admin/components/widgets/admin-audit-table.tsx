import { Fragment } from "react";
import type { AuditRow } from "@/src/features/audits/types/audit-types";
import { AuditStatusBadge } from "@/components/dashboard-widgets";
import { Icon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const ADMIN_AUDIT_PAGE_SIZE = 5;

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function AuditTableToolbar({
  search,
  filter,
  onSearchChange,
  onFilterChange,
}: {
  search: string;
  filter: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 max-[560px]:flex-col max-[560px]:items-stretch">
      <div className="flex h-10 w-[min(320px,100%)] items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 max-[560px]:w-full">
        <Icon name="search" />
        <Input
          className="h-auto min-w-0 border-0 bg-transparent px-0 py-0 text-xs font-medium text-[#22302a] shadow-none hover:border-0 focus-visible:ring-0 placeholder:text-[#98a79f]"
          aria-label="Search audit jobs"
          placeholder="Search website, client or job ID"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
      <Select value={filter} onValueChange={onFilterChange}>
        <SelectTrigger
          className="h-[38px] w-[140px] min-w-[140px] rounded-[9px] border-[var(--line)] bg-[var(--surface)] text-xs font-medium text-[var(--ink)] shadow-sm max-[560px]:w-full"
          aria-label="Filter audit state"
        >
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All statuses</SelectItem>
          <SelectItem value="QUEUED">Queued</SelectItem>
          <SelectItem value="PROCESSING">Processing</SelectItem>
          <SelectItem value="COMPLETED">Completed</SelectItem>
          <SelectItem value="FAILED">Failed</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

function AuditTableRow({
  audit,
  onSelect,
}: {
  audit: AuditRow;
  onSelect: (audit: AuditRow) => void;
}) {
  const siteName = audit.url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const isActive = ["QUEUED", "PROCESSING"].includes(audit.status);

  return (
    <tr>
      <td>
        <div className="flex items-center gap-2.5">
          <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-[var(--green-soft)] text-[10px] font-bold text-[var(--green-dark)]">{siteName.charAt(0).toUpperCase()}</span>
          <div>
            <strong className="block max-w-[260px] overflow-hidden text-ellipsis whitespace-nowrap text-[10px] font-bold text-[var(--ink)]">{siteName}</strong>
            <small className="mt-1 block text-[8px] text-[var(--muted)]">
              {audit.businessType} · Job {audit.jobId}
            </small>
          </div>
        </div>
      </td>
      <td>
        <span className="text-[9px] text-[var(--muted)]">
          {audit.city}, {audit.state}
        </span>
      </td>
      <td>
        <AuditStatusBadge state={audit.status} showIndicator />
        {isActive && (
          <div className="mt-1.5 flex max-w-[115px] items-center gap-1.5">
            <Progress value={audit.progress ?? 0} />
            <small className="text-[8px] text-[var(--muted)]">{audit.progress ?? 0}%</small>
          </div>
        )}
      </td>
      <td>
        {audit.overallScore === null ? (
          <span className="muted-dash">—</span>
        ) : (
          <span className="text-xs font-bold text-[var(--green-dark)]">
            <b>{audit.overallScore}</b>
            <small className="ml-0.5 text-[8px] text-[var(--muted)]">/100</small>
          </span>
        )}
      </td>
      <td>
        <span className="text-[9px] text-[var(--muted)]">{dateLabel(audit.createdAt)}</span>
      </td>
      <td>
        <Button
          variant="ghost"
          size="icon-sm"
          className="size-7 rounded-lg border border-[var(--line)] text-[var(--muted)] hover:border-[var(--green)] hover:text-[var(--green)]"
          aria-label={`View audit ${audit.jobId}`}
          onClick={() => onSelect(audit)}
        >
          <Icon name="arrow" />
        </Button>
      </td>
    </tr>
  );
}

function AuditTableBody({
  audits,
  allAuditCount,
  loading,
  onSelect,
}: {
  audits: AuditRow[];
  allAuditCount: number;
  loading: boolean;
  onSelect: (audit: AuditRow) => void;
}) {
  if (loading) {
    return (
      <tr>
        <td colSpan={6}>
          <div className="flex min-h-[140px] flex-col items-center justify-center text-[10px] text-[var(--muted)]">
            <span className="mb-2 size-4 animate-spin rounded-full border-2 border-[var(--line)] border-t-[var(--green)]" />
            Loading audits...
          </div>
        </td>
      </tr>
    );
  }

  if (audits.length === 0) {
    return (
      <tr>
        <td colSpan={6}>
          <div className="flex min-h-[140px] flex-col items-center justify-center text-[10px] text-[var(--muted)]">
            <span className="grid size-10 place-items-center rounded-xl bg-[var(--green-soft)] text-[var(--green)]">
              <Icon name="search" />
            </span>
            <strong className="mt-2 text-[11px] text-[var(--ink)]">
              {allAuditCount ? "No matching audits" : "No audit jobs yet"}
            </strong>
            <span className="mt-1">
              {allAuditCount
                ? "Try changing your search or filter."
                : "Use New audit to queue the first job."}
            </span>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <>
      {audits.map((audit) => (
        <AuditTableRow key={audit.jobId} audit={audit} onSelect={onSelect} />
      ))}
    </>
  );
}

function AuditTablePagination({
  total,
  page,
  onPageChange,
}: {
  total: number;
  page: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_AUDIT_PAGE_SIZE));
  const firstVisible =
    total === 0 ? 0 : (page - 1) * ADMIN_AUDIT_PAGE_SIZE + 1;
  const lastVisible = Math.min(page * ADMIN_AUDIT_PAGE_SIZE, total);
  const visiblePages = Array.from(
    new Set([1, page - 1, page, page + 1, totalPages]),
  )
    .filter((pageNumber) => pageNumber >= 1 && pageNumber <= totalPages)
    .sort((left, right) => left - right);

  if (total === 0) return null;

  return (
    <div className="flex items-center justify-between gap-3 text-[9px] text-[var(--muted)] max-[560px]:flex-col max-[560px]:items-start">
      <span>
        Showing {firstVisible}–{lastVisible} of {total} jobs
      </span>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#audit-jobs"
              size="sm"
              aria-disabled={page === 1}
              tabIndex={page === 1 ? -1 : undefined}
              className={page === 1 ? "pointer-events-none opacity-50" : ""}
              onClick={(event) => {
                event.preventDefault();
                onPageChange(Math.max(1, page - 1));
              }}
            />
          </PaginationItem>
          {visiblePages.map((pageNumber, index) => (
            <Fragment key={pageNumber}>
              {index > 0 && pageNumber - visiblePages[index - 1] > 1 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationLink
                  size="sm"
                  href="#audit-jobs"
                  isActive={pageNumber === page}
                  aria-label={`Go to page ${pageNumber}`}
                  onClick={(event) => {
                    event.preventDefault();
                    onPageChange(pageNumber);
                  }}
                >
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            </Fragment>
          ))}
          <PaginationItem>
            <PaginationNext
              href="#audit-jobs"
              size="sm"
              aria-disabled={page === totalPages}
              tabIndex={page === totalPages ? -1 : undefined}
              className={
                page === totalPages ? "pointer-events-none opacity-50" : ""
              }
              onClick={(event) => {
                event.preventDefault();
                onPageChange(Math.min(totalPages, page + 1));
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

export function AdminAuditTable({
  audits,
  allAuditCount,
  loading,
  error,
  search,
  filter,
  page,
  failedCount,
  onSearchChange,
  onFilterChange,
  onPageChange,
  onRetry,
  onSelect,
}: {
  audits: AuditRow[];
  allAuditCount: number;
  loading: boolean;
  error: string;
  search: string;
  filter: string;
  page: number;
  failedCount: number;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onRetry: () => void;
  onSelect: (audit: AuditRow) => void;
}) {
  const paginatedAudits = audits.slice(
    (page - 1) * ADMIN_AUDIT_PAGE_SIZE,
    page * ADMIN_AUDIT_PAGE_SIZE,
  );

  return (
    <Card
      className="m-0 rounded-[14px] border-[var(--line)] bg-[var(--surface)] px-6 pb-4 pt-[22px] shadow-sm max-[560px]:px-3 max-[560px]:pb-3 max-[560px]:pt-4"
      id="audit-jobs"
      role="region"
      aria-label="Audit jobs"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="mb-2 text-[9px] font-bold tracking-[1.35px] text-[var(--muted)]">PIPELINE ACTIVITY</p>
          <h2 className="text-base font-semibold text-[var(--ink)]">Audit jobs</h2>
          <p className="mt-1 text-[10px] text-[var(--muted)]">Review the latest work across your client portfolio.</p>
        </div>
        <span className="rounded-lg bg-[var(--green-soft)] px-2 py-1 text-[10px] font-bold text-[var(--green-dark)]">
          {audits.length} {audits.length === 1 ? "job" : "jobs"}
        </span>
      </div>
      {error && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-[10px] text-red-700" role="alert">
          <Icon name="alert" />
          {error}
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto gap-[7px] px-2 py-[7px] text-[11px] font-bold text-[#36876b]"
            onClick={onRetry}
          >
            Retry
          </Button>
        </div>
      )}
      <AuditTableToolbar
        search={search}
        filter={filter}
        onSearchChange={onSearchChange}
        onFilterChange={onFilterChange}
      />
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-[750px] border-separate border-spacing-0 text-left [&_th]:border-b [&_th]:border-[var(--line)] [&_th]:px-3 [&_th]:py-3 [&_th]:text-[8px] [&_th]:font-bold [&_th]:text-[var(--muted)] [&_td]:border-b [&_td]:border-[var(--line)] [&_td]:px-3 [&_td]:py-3 [&_td]:text-[10px] [&_td]:text-[var(--muted)]">
          <thead>
            <tr>
              <th>WEBSITE / BUSINESS</th>
              <th>LOCATION</th>
              <th>STATUS / PROGRESS</th>
              <th>SEO SCORE</th>
              <th>SUBMITTED</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <AuditTableBody
              audits={paginatedAudits}
              allAuditCount={allAuditCount}
              loading={loading}
              onSelect={onSelect}
            />
          </tbody>
        </table>
      </div>
      {!loading && (
        <AuditTablePagination
          total={audits.length}
          page={page}
          onPageChange={onPageChange}
        />
      )}
      <div className="mt-3 flex items-center gap-4 border-t border-[var(--line)] pt-3 text-[8px] text-[var(--muted)]">
        <span>
          <span className="inline-block size-1.5 rounded-full bg-emerald-500" /> Supabase data
        </span>
        <span>Queue state is refreshed automatically</span>
        {failedCount > 0 && (
          <span className="ml-auto inline-flex items-center gap-1 text-red-600">
            <Icon name="alert" />
            {failedCount} failed job{failedCount === 1 ? "" : "s"}
          </span>
        )}
      </div>
    </Card>
  );
}
