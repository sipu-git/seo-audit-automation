"use client";

import { useAppSelector } from "@/src/shared/lib/redux-hooks";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ProfileOverview() {
  const user = useAppSelector((state) => state.auth.user);

  if (!user) return null;

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Account details</CardTitle>
        <CardDescription>
          Your profile information associated with this workspace.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium text-slate-500">Full name</p>
          <p className="mt-1 font-medium">{user.fullName}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">Email</p>
          <p className="mt-1 font-medium">{user.email}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">Phone</p>
          <p className="mt-1 font-medium">{user.phone || "Not provided"}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">Member since</p>
          <p className="mt-1 font-medium">
            {new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(
              new Date(user.createdAt),
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
