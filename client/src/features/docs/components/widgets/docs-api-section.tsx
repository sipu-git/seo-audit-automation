import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { endpoints } from "@/src/features/docs/data/endpoints";
import { DocsSectionHeading } from "@/src/features/docs/components/widgets/docs-section-heading";

export function DocsApiSection() {
  return (
    <section id="api" className="scroll-mt-24 space-y-5">
      <DocsSectionHeading
        eyebrow="INTEGRATION POINTS"
        title="REST API endpoints"
        description="The frontend calls the standalone Express API; BullMQ and the separate worker process handle long-running audits."
      />

      <Card className="overflow-hidden border-slate-200/90 shadow-sm">
        <div className="divide-y divide-slate-100">
          {endpoints.map((endpoint) => {
            const isGet = endpoint.method === "GET";
            return (
              <div
                key={`${endpoint.method}-${endpoint.path}`}
                className="flex flex-col gap-2 p-4 transition-colors hover:bg-slate-50/70 sm:flex-row sm:items-center sm:gap-4"
              >
                <Badge
                  variant="outline"
                  className={`w-fit font-mono text-[10px] font-bold tracking-wider ${
                    isGet
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-amber-200 bg-amber-50 text-amber-800"
                  }`}
                >
                  {endpoint.method}
                </Badge>
                <code className="rounded bg-slate-100 px-2 py-1 font-mono text-xs font-semibold text-slate-900 sm:w-60 sm:shrink-0">
                  {endpoint.path}
                </code>
                <p className="text-xs text-slate-600 sm:flex-1">{endpoint.purpose}</p>
              </div>
            );
          })}
        </div>
      </Card>
    </section>
  );
}

