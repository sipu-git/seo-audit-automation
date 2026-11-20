"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

type AccountDeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fullName: string;
  email: string;
  deleting: boolean;
  error: string;
  onDelete: () => void | Promise<void>;
};

export function AccountDeleteDialog({
  open,
  onOpenChange,
  fullName,
  email,
  deleting,
  error,
  onDelete,
}: AccountDeleteDialogProps) {
  const [nameConfirmation, setNameConfirmation] = useState("");
  const [emailConfirmation, setEmailConfirmation] = useState("");

  useEffect(() => {
    if (!open) {
      setNameConfirmation("");
      setEmailConfirmation("");
    }
  }, [open]);

  const confirmedEmail = emailConfirmation.trim();
  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(confirmedEmail);
  const nameMatches = nameConfirmation.trim().toLocaleLowerCase() === fullName.trim().toLocaleLowerCase();
  const emailMatches = confirmedEmail.toLocaleLowerCase() === email.trim().toLocaleLowerCase();
  const canConfirm = nameMatches && emailIsValid && emailMatches;

  return (
    <AlertDialog open={open} onOpenChange={(nextOpen) => {
      if (!deleting) onOpenChange(nextOpen);
    }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-700">Delete your account?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes your account and signs you out. Existing audits will remain in the workspace without an account owner.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="grid gap-4">
          <label className="grid gap-1.5 text-xs font-medium text-[var(--ink)]">
            Type <span className="font-bold">{fullName}</span> to confirm
            <Input autoComplete="off" autoFocus value={nameConfirmation}
              aria-invalid={nameConfirmation.length > 0 && !nameMatches}
              onChange={(event) => setNameConfirmation(event.target.value)} />
          </label>
          <label className="grid gap-1.5 text-xs font-medium text-[var(--ink)]">
            Type your account email: <span className="font-bold">{email}</span>
            <Input autoComplete="email" type="email" value={emailConfirmation}
              aria-invalid={emailConfirmation.length > 0 && (!emailIsValid || !emailMatches)}
              onChange={(event) => setEmailConfirmation(event.target.value)} />
            {emailConfirmation.length > 0 && !emailIsValid && (
              <span className="font-normal text-red-700">Enter a valid email address.</span>
            )}
            {emailIsValid && !emailMatches && (
              <span className="font-normal text-red-700">Enter the email address on your account.</span>
            )}
          </label>
        </div>

        {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button type="button" variant="destructive" disabled={!canConfirm || deleting}
              onClick={(event) => {
                event.preventDefault();
                void onDelete();
              }}>
              {deleting ? <span className="flex items-center gap-2"><Spinner /> Deleting account...</span> : "Confirm account deletion"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
