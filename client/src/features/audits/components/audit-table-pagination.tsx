import { Fragment } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export function AuditTablePagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const visiblePages = Array.from(new Set([1, page - 1, page, page + 1, totalPages]))
    .filter((number) => number >= 1 && number <= totalPages)
    .sort((left, right) => left - right);

  return (
    <Pagination className="mx-0 w-auto justify-end">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            size="sm"
            href="#audit-results"
            aria-disabled={page <= 1}
            tabIndex={page <= 1 ? -1 : undefined}
            className={page <= 1 ? "pointer-events-none opacity-50" : ""}
            onClick={(event) => {
              event.preventDefault();
              onPageChange(Math.max(1, page - 1));
            }}
          />
        </PaginationItem>
        {visiblePages.map((number, index) => (
          <Fragment key={number}>
            {index > 0 && number - visiblePages[index - 1] > 1 && (
              <PaginationItem><PaginationEllipsis /></PaginationItem>
            )}
            <PaginationItem>
              <PaginationLink
                size="sm"
                href="#audit-results"
                isActive={number === page}
                aria-label={`Go to page ${number}`}
                onClick={(event) => {
                  event.preventDefault();
                  onPageChange(number);
                }}
              >
                {number}
              </PaginationLink>
            </PaginationItem>
          </Fragment>
        ))}
        <PaginationItem>
          <PaginationNext
            size="sm"
            href="#audit-results"
            aria-disabled={page >= totalPages}
            tabIndex={page >= totalPages ? -1 : undefined}
            className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
            onClick={(event) => {
              event.preventDefault();
              onPageChange(Math.min(totalPages, page + 1));
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
