import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { AuditRow } from "@/src/features/audits/types/audit-types";
import { Spinner } from "@/components/ui/spinner";

function websiteLabel(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function AuditDeleteDialog({
  audit,
  deleting,
  error,
  onCancel,
  onConfirm,
}: {
  audit: AuditRow | null;
  deleting: boolean;
  error: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog
      open={Boolean(audit)}
      onOpenChange={(open) => {
        if (!open && !deleting) onCancel();
      }}
    >
      <DialogContent showCloseButton={!deleting}>
        <DialogHeader>
          <DialogTitle>Delete this audit?</DialogTitle>
          <DialogDescription>
            This will permanently remove the audit for {audit ? websiteLabel(audit.url) : "this website"}.
          </DialogDescription>
        </DialogHeader>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button type="button" variant="outline" disabled={deleting} onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" disabled={deleting} onClick={onConfirm}>
            {deleting ? <span className="inline-flex items-center gap-1.5"><Spinner/> Deleting...</span>: "Delete audit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
