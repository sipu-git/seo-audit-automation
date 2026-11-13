import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { components } from "@/src/features/docs/data/components";
import { DocsSectionHeading } from "@/src/features/docs/components/widgets/docs-section-heading";

export function DocsModulesSection() {
  return (
    <section id="modules" className="scroll-mt-24 space-y-5">
      <DocsSectionHeading
        eyebrow="ARCHITECTURE MAP"
        title="What each project area is responsible for"
        description="Use this modular code breakdown when extending functionality or inspecting specific features."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {components.map((component) => (
          <Card
            key={component.area}
            className="border-slate-200/90 transition-all hover:border-slate-300 hover:shadow-sm"
          >
            <CardHeader className="space-y-2 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-slate-900">
                  {component.area}
                </CardTitle>
              </div>
              <code className="block truncate rounded bg-slate-100 px-2 py-1 font-mono text-[11px] font-medium text-emerald-800">
                {component.paths}
              </code>
            </CardHeader>
            <CardContent>
              <p className="text-xs leading-relaxed text-slate-600">
                {component.responsibility}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

