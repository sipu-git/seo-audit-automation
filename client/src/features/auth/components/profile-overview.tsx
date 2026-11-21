"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useApolloClient, useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AccountDeleteDialog } from "@/src/features/auth/components/account-delete-dialog";
import {
  COMPLETE_MY_PROFILE_PICTURE_UPLOAD_MUTATION,
  DELETE_MY_ACCOUNT_MUTATION,
  UPDATE_MY_PROFILE_MUTATION,
  type CompleteMyProfilePictureUploadMutationData,
  type CompleteMyProfilePictureUploadMutationVariables,
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
import { ProfilePicture } from "@/src/features/auth/components/profile-picture";

const MAX_PROFILE_PICTURE_SIZE = 5 * 1024 * 1024;
const PROFILE_PICTURE_TYPES = ["image/jpeg", "image/png", "image/webp"];

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
  const [picturePreview, setPicturePreview] = useState<string | null>(null);
  const [pictureError, setPictureError] = useState("");
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const pictureInputRef = useRef<HTMLInputElement>(null);
  const [updateMyProfile, { loading: saving }] = useMutation<
    UpdateMyProfileMutationData,
    UpdateMyProfileMutationVariables
  >(UPDATE_MY_PROFILE_MUTATION);
  const [deleteMyAccount, { loading: deleting }] = useMutation<
    DeleteMyAccountMutationData
  >(DELETE_MY_ACCOUNT_MUTATION);
  const [completePictureUpload] = useMutation<
    CompleteMyProfilePictureUploadMutationData,
    CompleteMyProfilePictureUploadMutationVariables
  >(COMPLETE_MY_PROFILE_PICTURE_UPLOAD_MUTATION);

  useEffect(() => {
    setFullName(user?.fullName ?? "");
    setEmail(user?.email ?? "");
    setPhone(user?.phone ?? "");
  }, [user?.id, user?.fullName, user?.email, user?.phone]);

  useEffect(() => {
    if (!picturePreview) return;
    return () => URL.revokeObjectURL(picturePreview);
  }, [picturePreview]);

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

  async function handleProfilePictureChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;

    setPictureError("");
    setSaveSuccess("");
    if (!PROFILE_PICTURE_TYPES.includes(file.type)) {
      setPictureError("Choose a JPEG, PNG, or WebP image.");
      return;
    }
    if (file.size > MAX_PROFILE_PICTURE_SIZE) {
      setPictureError("The profile picture must be 5 MB or smaller.");
      return;
    }

    setPicturePreview(URL.createObjectURL(file));
    setUploadingPicture(true);
    try {
      const response = await fetch("/api/profile-picture", {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const upload = await response.json() as { reference?: string; error?: string };
      if (!response.ok || !upload.reference) {
        throw new Error(upload.error || "The image could not be uploaded to storage.");
      }

      const completeResult = await completePictureUpload({
        variables: { reference: upload.reference },
      });
      const updatedUser = completeResult.data?.completeMyProfilePictureUpload;
      if (!updatedUser) throw new Error("The uploaded image could not be saved to your profile.");

      dispatch(setUser(updatedUser));
      client.writeQuery<CurrentUserQueryData>({
        query: CURRENT_USER_QUERY,
        data: { me: updatedUser },
      });
      setPicturePreview(null);
      setSaveSuccess("Your profile picture has been updated.");
    } catch (error) {
      setPicturePreview(null);
      setPictureError(error instanceof Error ? error.message : "Unable to update your profile picture.");
    } finally {
      setUploadingPicture(false);
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
          <div className="mb-6 flex flex-wrap items-center gap-4 border-b border-[var(--line)] pb-5">
            <ProfilePicture
              src={picturePreview ?? user.profilePicture}
              alt="Your profile picture"
              fallback={(user.fullName || user.email || "C").charAt(0).toUpperCase()}
              className="size-16 text-base"
            />
            <div className="grid gap-2">
              <div>
                <p className="text-sm font-medium text-[var(--ink)]">Profile picture</p>
                <p className="mt-1 text-xs text-[var(--muted)]">JPEG, PNG, or WebP, up to 5 MB.</p>
              </div>
              <input
                ref={pictureInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={handleProfilePictureChange}
                aria-label="Choose a profile picture"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploadingPicture || saving || deleting}
                onClick={() => pictureInputRef.current?.click()}
              >
                {uploadingPicture ? "Uploading picture…" : "Change picture"}
              </Button>
              {pictureError && <p role="alert" className="text-xs text-red-700">{pictureError}</p>}
            </div>
          </div>
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
              <Button type="submit" disabled={saving || deleting || uploadingPicture}>
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
