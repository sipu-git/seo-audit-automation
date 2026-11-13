import Link from "next/link";
import { ArrowRight, CircleHelp } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { areas } from "@/src/features/docs/data/area";
import { DocsSectionHeading } from "@/src/features/docs/components/widgets/docs-section-heading";

export function DocsDashboardsSection() {
  return (
    <section id="dashboards" className="scroll-mt-24 space-y-5">
      <DocsSectionHeading
        eyebrow="PRODUCT AREAS"
        title="Choose the view that fits your task"
        description="Both dashboards share the same audit queue, but history persistence and administrative controls are customized for each role."
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {areas.map((area) => {
          const AreaIcon = area.icon;
          return (
            <Card
              key={area.href}
              className="flex flex-col justify-between border-slate-200/90 transition-all hover:border-emerald-300 hover:shadow-md"
            >
              <CardHeader className="space-y-3 pb-4">
                <div className="flex items-center justify-between">
                  <div className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-800">
                    <AreaIcon className="size-5" />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-medium text-slate-500">
                    {area.audience}
                  </Badge>
                </div>
                <CardTitle className="text-base font-semibold text-slate-900">
                  {area.title}
                </CardTitle>
                <CardDescription className="text-xs leading-relaxed text-slate-600">
                  {area.description}
                </CardDescription>
              </CardHeader>
              <CardFooter className="pt-0">
                <Button
                  asChild
                  variant="ghost"
                  className="group w-full justify-between border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-800 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
                >
                  <Link href={area.href}>
                    <span>Visit {area.title}</span>
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <Card className="border-sky-200 bg-sky-50/60 shadow-none">
        <CardContent className="flex items-start gap-3 p-4">
          <CircleHelp className="mt-0.5 size-5 shrink-0 text-sky-700" />
          <div className="text-xs leading-relaxed text-sky-950">
            <strong className="font-semibold">Where is client history stored?</strong> The client
            dashboard keeps recent audits in local browser storage for privacy and zero login
            friction. The admin portal reads persisted records directly from PostgreSQL, meaning
            clearing browser cache never deletes audits from the server.
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

