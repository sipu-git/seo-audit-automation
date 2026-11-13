import { Code2, Server, ShieldCheck, Workflow } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { environmentGroups } from "@/src/features/docs/data/endpointsGroup";
import { DocsSectionHeading } from "@/src/features/docs/components/widgets/docs-section-heading";

export function DocsSetupSection() {
  return (
    <section id="setup" className="scroll-mt-24 space-y-5">
      <DocsSectionHeading
        eyebrow="LOCAL DEVELOPMENT"
        title="Run the workspace locally"
        description="The Next.js frontend, Express API, and BullMQ worker run as separate processes."
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <Card className="border-slate-200/90">
          <CardHeader className="space-y-2 pb-3">
            <div className="flex items-center gap-2 text-emerald-800">
              <Code2 className="size-5" />
              <CardTitle className="text-sm font-semibold">1. Install and prepare</CardTitle>
            </div>
            <div className="rounded-lg bg-slate-950 p-3 font-mono text-xs text-emerald-400">
              <p>npm ci --prefix frontend</p>
              <p>npm ci --prefix backend</p>
              <p>npm run db:push --prefix backend</p>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs leading-relaxed text-slate-600">
              Link the Supabase project, apply reviewed SQL migrations, and configure Supabase and Redis environment variables before starting services.
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/90">
          <CardHeader className="space-y-2 pb-3">
            <div className="flex items-center gap-2 text-emerald-800">
              <Server className="size-5" />
              <CardTitle className="text-sm font-semibold">2. Start web app</CardTitle>
            </div>
            <div className="rounded-lg bg-slate-950 p-3 font-mono text-xs text-emerald-400">
              <p>npm run dev --prefix frontend</p>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs leading-relaxed text-slate-600">
              Launches Next.js on port 3000 and proxies /api requests to the backend on port 4000.
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/90">
          <CardHeader className="space-y-2 pb-3">
            <div className="flex items-center gap-2 text-emerald-800">
              <Workflow className="size-5" />
              <CardTitle className="text-sm font-semibold">3. Start API and worker</CardTitle>
            </div>
            <div className="rounded-lg bg-slate-950 p-3 font-mono text-xs text-emerald-400">
              <p>npm run api --prefix backend</p>
              <p>npm run worker --prefix backend</p>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs leading-relaxed text-slate-600">
              The API accepts requests; the worker consumes Redis jobs, crawls sites, calls Google Gemini, and creates PDFs.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Environment Variables Card */}
      <Card className="border-slate-200/90">
        <CardHeader className="space-y-2 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-lg bg-emerald-50 text-emerald-800">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">Environment variables</CardTitle>
              <CardDescription className="text-xs">
                Keep frontend settings in <code>frontend/.env.local</code> and backend secrets in <code>backend/.env</code>. Never commit credentials to git.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-0">
          {environmentGroups.map((group) => (
            <div key={group.title} className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {group.title}
              </h4>
              <div className="divide-y divide-slate-100 rounded-lg border border-slate-200/70 bg-slate-50/50">
                {group.values.map(([name, description]) => (
                  <div
                    key={name}
                    className="flex flex-col gap-1 p-3 text-xs sm:flex-row sm:items-center sm:gap-4"
                  >
                    <code className="font-mono font-semibold text-emerald-800 sm:w-64 sm:shrink-0">
                      {name}
                    </code>
                    <span className="text-slate-600 sm:flex-1">{description}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
