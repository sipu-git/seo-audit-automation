"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useApolloClient, useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AccountDeleteDialog } from "@/src/features/auth/components/account-delete-dialog";
import {
  DELETE_MY_ACCOUNT_MUTATION,
  UPDATE_MY_PROFILE_MUTATION,
  type DeleteMyAccountMutationData,
  type UpdateMyProfileMutationData,
  type UpdateMyProfileMutationVariables,
} from "@/src/features/auth/api/auth-mutations";
import {
  CURRENT_USER_QUERY,
  type CurrentUserQueryData,
} from "@/src/features/auth/api/auth-queries";
import { clearAuth, setUser } from "@/src/features/auth/auth-slice";
import type { AuthUser } from "@/src/features/auth/api/auth-types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/src/shared/lib/redux-hooks";
import { Spinner } from "@/components/ui/spinner";

export function ProfileOverview() {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const client = useApolloClient();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [updateMyProfile, { loading: saving }] = useMutation<
    UpdateMyProfileMutationData,
    UpdateMyProfileMutationVariables
  >(UPDATE_MY_PROFILE_MUTATION);
  const [deleteMyAccount, { loading: deleting }] = useMutation<
    DeleteMyAccountMutationData
  >(DELETE_MY_ACCOUNT_MUTATION);

  useEffect(() => {
    setFullName(user?.fullName ?? "");
    setEmail(user?.email ?? "");
    setPhone(user?.phone ?? "");
  }, [user?.id, user?.fullName, user?.email, user?.phone]);

  if (!user) return null;

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveError("");
    setSaveSuccess("");

    try {
      const { data } = await updateMyProfile({
        variables: {
          input: {
            fullName: fullName.trim(),
            email: email.trim(),
            phone: phone.trim() || null,
          },
        },
      });
      if (!data?.updateMyProfile) {
        throw new Error("The profile update returned no user data.");
      }

      const updatedUser: AuthUser = data.updateMyProfile;
      dispatch(setUser(updatedUser));
      client.writeQuery<CurrentUserQueryData>({
        query: CURRENT_USER_QUERY,
        data: { me: updatedUser },
      });
      setSaveSuccess("Your profile has been updated.");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Unable to update your profile.");
    }
  }

  async function handleDeleteAccount() {
    if (deleting) return;
    setDeleteError("");

    try {
      const { data } = await deleteMyAccount();
      if (!data?.deleteMyAccount) {
        throw new Error("The account could not be deleted.");
      }

      dispatch(clearAuth());
      await client.clearStore();
      setDeleteDialogOpen(false);
      router.replace("/auth/login");
      router.refresh();
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Unable to delete your account.");
    }
  }

  return (
    <div className="grid max-w-3xl gap-5">
      <Card>
        <CardHeader>
          <CardTitle>Account details</CardTitle>
          <CardDescription>
            Update the name, email, and phone number associated with your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-5" onSubmit={handleProfileSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-xs font-medium text-[var(--ink)]">
                Full name
                <Input
                  autoComplete="name"
                  maxLength={100}
                  required
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                />
              </label>
              <label className="grid gap-1.5 text-xs font-medium text-[var(--ink)]">
                Email
                <Input
                  autoComplete="email"
                  maxLength={254}
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>
              <label className="grid gap-1.5 text-xs font-medium text-[var(--ink)]">
                Phone
                <Input
                  autoComplete="tel"
                  placeholder="Optional, include country code"
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
              </label>
              <div className="grid content-start gap-1.5 text-xs">
                <span className="font-medium text-[var(--ink)]">Member since</span>
                <span className="pt-2 text-[var(--muted)]">
                  {new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(
                    new Date(user.createdAt),
                  )}
                </span>
              </div>
            </div>

            {saveError && <p role="alert" className="text-xs text-red-700">{saveError}</p>}
            {saveSuccess && <p role="status" className="text-xs text-emerald-700">{saveSuccess}</p>}

            <div>
              <Button type="submit" disabled={saving || deleting}>
                {saving ? <span className="flex gap-1 items-center"><Spinner/> Saving…</span> : "Save changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-700">Delete account</CardTitle>
          <CardDescription>
            Permanently remove your account and sign out. Existing audits are retained without an account owner.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div>
            <Button
              type="button"
              variant="destructive"
              disabled={saving || deleting}
              onClick={() => {
                setDeleteError("");
                setDeleteDialogOpen(true);
              }}
            >
              Delete my account
            </Button>
          </div>
        </CardContent>
      </Card>
      <AccountDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        fullName={user.fullName}
        email={user.email}
        onDelete={handleDeleteAccount}
        deleting={deleting}
        error={deleteError}
      />
    </div>
  );
}
