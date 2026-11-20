import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AuditDetailsLoadingSkeleton() {
  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-black/20 p-4"
      role="status"
      aria-label="Loading audit details"
    >
      <div className="max-h-[calc(100dvh-2rem)] w-full max-w-7xl overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface-raised)] shadow-xl">
        <div className="border-b border-[var(--line)] px-5 py-4 sm:px-6">
          <Skeleton className="mb-3 h-3 w-24" />
          <Skeleton className="h-6 w-56 max-w-full" />
          <Skeleton className="mt-3 h-4 w-72 max-w-full" />
        </div>
        <div className="max-h-[calc(100dvh-9rem)] space-y-4 overflow-hidden p-4 sm:p-6">
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-6 w-36" />
          </div>
          <Card className="grid min-w-0 gap-5 p-4 sm:grid-cols-2 sm:p-5">
            <div className="flex items-center gap-4">
              <Skeleton className="size-20 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-3">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-5 w-40 max-w-full" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5 max-w-full" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 min-[520px]:grid-cols-2">
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          </Card>
          <div className="grid gap-4 min-[900px]:grid-cols-2">
            {Array.from({ length: 4 }, (_, index) => (
              <Card key={index} className="space-y-3 p-4">
                <Skeleton className="h-4 w-2/3 max-w-full" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6 max-w-full" />
                <Skeleton className="h-16 w-full" />
              </Card>
            ))}
          </div>
        </div>
      </div>
      <span className="sr-only">Preparing the audit report</span>
    </div>
  );
}

export function AuditFormLoadingSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Loading audit form">
      <div className="grid gap-3 min-[781px]:grid-cols-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-10 w-40 max-w-full" />
      <span className="sr-only">Preparing the audit form</span>
    </div>
  );
}

export function AuditReportLoadingSkeleton() {
  return (
    <div className="grid min-w-0 gap-4" role="status" aria-label="Loading audit report">
      <Card className="grid min-w-0 gap-5 p-4 sm:grid-cols-2 sm:p-5">
        <div className="flex items-center gap-4">
          <Skeleton className="size-20 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-3">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-5 w-40 max-w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5 max-w-full" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 min-[520px]:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      </Card>
      <div className="grid gap-4 min-[900px]:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <Card key={index} className="space-y-3 p-4">
            <Skeleton className="h-4 w-2/3 max-w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6 max-w-full" />
            <Skeleton className="h-16 w-full" />
          </Card>
        ))}
      </div>
      <span className="sr-only">Preparing the audit report</span>
    </div>
  );
}
