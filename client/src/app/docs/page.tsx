"use client";

import dynamic from "next/dynamic";
import { AppShell } from "@/src/shared/layout/app-shell";
import { Skeleton } from "@/src/components/ui/skeleton";

/* ── Reusable loading skeletons ── */
const SectionSkeleton = () => (
  <div className="space-y-4 rounded-xl border p-6">
    <Skeleton className="h-7 w-1/3" />
    <Skeleton className="h-4 w-2/3" />
    <div className="grid gap-4 pt-2 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-32 rounded-lg" />
      ))}
    </div>
  </div>
);

const HeroSkeleton = () => (
  <div className="space-y-4 rounded-xl border p-8">
    <Skeleton className="mx-auto h-10 w-2/3" />
    <Skeleton className="mx-auto h-5 w-1/2" />
    <Skeleton className="mx-auto h-48 w-full rounded-lg" />
  </div>
);

const TocSkeleton = () => (
  <div className="space-y-3 rounded-xl border p-6">
    <Skeleton className="h-6 w-1/4" />
    {Array.from({ length: 6 }).map((_, i) => (
      <Skeleton key={i} className="h-4 w-1/2" />
    ))}
  </div>
);

/* ── Dynamic imports ── */
const DocsHero = dynamic(() =>import("@/src/features/docs/components/widgets/docs-hero").then((m) => m.DocsHero),
  { loading: () => <HeroSkeleton /> }
);

const DocsToc = dynamic(
  () =>import("@/src/features/docs/components/widgets/docs-toc").then((m) => m.DocsToc),
  { loading: () => <TocSkeleton /> }
);

const DocsWorkflowSection = dynamic(
  () =>
    import(
      "@/src/features/docs/components/widgets/docs-workflow-section"
    ).then((m) => m.DocsWorkflowSection),
  { loading: () => <SectionSkeleton /> }
);

const DocsDashboardsSection = dynamic(
  () =>
    import(
      "@/src/features/docs/components/widgets/docs-dashboards-section"
    ).then((m) => m.DocsDashboardsSection),
  { loading: () => <SectionSkeleton /> }
);

const DocsModulesSection = dynamic(
  () =>
    import("@/src/features/docs/components/widgets/docs-modules-section").then(
      (m) => m.DocsModulesSection
    ),
  { loading: () => <SectionSkeleton /> }
);

const DocsApiSection = dynamic(
  () =>
    import("@/src/features/docs/components/widgets/docs-api-section").then(
      (m) => m.DocsApiSection
    ),
  { loading: () => <SectionSkeleton /> }
);

const DocsSetupSection = dynamic(
  () =>
    import("@/src/features/docs/components/widgets/docs-setup-section").then(
      (m) => m.DocsSetupSection
    ),
  { loading: () => <SectionSkeleton /> }
);

const DocsDataSourcesSection = dynamic(
  () =>
    import(
      "@/src/features/docs/components/widgets/docs-data-sources-section"
    ).then((m) => m.DocsDataSourcesSection),
  { loading: () => <SectionSkeleton /> }
);

const DocsFaqSection = dynamic(
  () =>
    import("@/src/features/docs/components/widgets/docs-faq-section").then(
      (m) => m.DocsFaqSection
    ),
  { loading: () => <SectionSkeleton /> }
);

export default function DocsPage() {
  return (
    <AppShell
      eyebrow="PROJECT GUIDE"
      title="How the audit workspace works"
      description="A practical guide to the dashboards, audit workflow, project modules, and local setup."
    >
      <div className="flex flex-col gap-10">
        <DocsHero />
        <DocsToc />
        <DocsWorkflowSection />
        <DocsDashboardsSection />
        <DocsModulesSection />
        <DocsApiSection />
        <DocsSetupSection />
        <DocsDataSourcesSection />
        <DocsFaqSection />
      </div>
    </AppShell>
  );
}
