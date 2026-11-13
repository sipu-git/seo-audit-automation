import { ArrowDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { workflow } from "@/src/features/docs/data/workflow";
import { DocsSectionHeading } from "@/src/features/docs/components/widgets/docs-section-heading";

export function DocsWorkflowSection() {
  return (
    <section id="workflow" className="scroll-mt-24 space-y-5">
      <DocsSectionHeading
        eyebrow="END-TO-END WORKFLOW"
        title="From website URL to finished report"
        description="Audits run asynchronously through BullMQ and Redis so user interfaces remain fast and responsive."
      />

      <div className="space-y-3">
        {workflow.map((step, index) => {
          const StepIcon = step.icon;
          return (
            <div key={step.number} className="relative">
              <Card className="border-[var(--line)] transition-all hover:border-[var(--green)] hover:shadow-md">
                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3 sm:w-64 sm:shrink-0">
                    <span className="grid size-8 place-items-center rounded-lg bg-[var(--green-soft)] font-mono text-xs font-bold text-[var(--green-dark)]">
                      {step.number}
                    </span>
                    <div className="grid size-10 place-items-center rounded-xl bg-[var(--surface-raised)] text-[var(--muted)]">
                      <StepIcon className="size-5" />
                    </div>
                    <h3 className="font-semibold text-[var(--ink)]">{step.title}</h3>
                  </div>

                  <p className="flex-1 text-xs leading-relaxed text-[var(--muted)]">
                    {step.description}
                  </p>

                  <div className="sm:text-right">
                    <code className="inline-block rounded-md bg-[var(--surface-raised)] px-2.5 py-1 font-mono text-[11px] font-semibold text-[var(--ink)]">
                      {step.detail}
                    </code>
                  </div>
                </CardContent>
              </Card>

              {index < workflow.length - 1 && (
                <div className="my-1 flex justify-center text-slate-300">
                  <ArrowDown className="size-4" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

