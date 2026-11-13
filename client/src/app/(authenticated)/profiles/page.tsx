import { ProfileOverview } from "@/src/features/auth/components/profile-overview";
import { AppShell } from "@/src/shared/layout/app-shell";

export default function ProfilePage() {
  return (
    <AppShell
      eyebrow="ACCOUNT"
      title="Your profile"
      description="Review the account details connected to your workspace."
    >
      <ProfileOverview />
    </AppShell>
  );
}
