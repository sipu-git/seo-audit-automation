import { AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/src/shared/lib/utils";

export function AuditRefreshBanner({
  activeCount,
  loading,
  lastUpdated,
  onRefresh,
}: {
  activeCount: number;
  loading: boolean;
  lastUpdated: Date | null;
  onRefresh: () => void;
}) {
  const lastChecked = lastUpdated?.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Alert
      variant="info"
      className={cn(
        "flex flex-wrap items-center gap-3 px-4 py-3.5",
        "[&>svg]:static [&>svg]:size-5 [&>svg+div]:translate-y-0 [&>svg~*]:pl-0",
      )}
    >
      <RefreshCw className={`size-5 shrink-0 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
      <div className="min-w-[220px] flex-1">
        <AlertTitle className="mb-1 flex flex-wrap items-center gap-2">
          Live audit updates
          {activeCount > 0
            ? <Badge variant="success">{activeCount} active</Badge>
            : <Badge variant="secondary">Up to date</Badge>}
        </AlertTitle>
        <AlertDescription className="text-xs">
          {activeCount > 0
            ? "Audits are running. Refresh manually to check their progress."
            : "Refresh manually to check for the latest results."}
          {lastChecked && <span className="ml-2">Last checked {lastChecked}</span>}
        </AlertDescription>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="gap-2 border-sky-200 bg-white/70 text-sky-900 hover:bg-white"
        onClick={onRefresh}
        disabled={loading}
      >
        <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
        Refresh now
      </Button>
    </Alert>
  );
}

export function AuditLoadError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  if (!message) return null;

  return (
    <Alert variant="destructive" role="alert">
      <AlertCircle className="size-4" />
      <AlertTitle>Couldn’t refresh your audits</AlertTitle>
      <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
        <span>{message}</span>
        <Button variant="outline" size="sm" onClick={onRetry}>Try again</Button>
      </AlertDescription>
    </Alert>
  );
}
