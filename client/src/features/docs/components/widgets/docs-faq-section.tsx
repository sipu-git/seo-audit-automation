import Link from "next/link";
import { ArrowRight, ListChecks } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DocsSectionHeading } from "@/src/features/docs/components/widgets/docs-section-heading";

export function DocsFaqSection() {
  const faqs = [
    {
      question: "Why is an audit staying queued?",
      answer: (
        <>
          Confirm Redis is running and reachable, and that the worker process is running via{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-emerald-800">
            npm run worker
          </code>
          . The web app enqueues jobs to Redis; it does not process them itself.
        </>
      ),
    },
    {
      question: "Why did an audit fail?",
      answer:
        "Open the audit details modal in the admin portal to inspect the error stack. Common causes include unresponsive target sites, unmigrated database schemas, or a missing or invalid Gemini API key.",
    },
    {
      question: "Why is the PDF download button disabled?",
      answer:
        "PDF downloads are unlocked as soon as the worker completes compilation and persists the document to local storage or S3. Check worker console output for any rendering logs.",
    },
    {
      question: "Are audit checks continuously polling the server?",
      answer:
        "The dashboards poll while at least one audit is queued or processing. Polling stops when all active audits complete or fail.",
    },
  ];

  return (
    <>
      <section id="faq" className="scroll-mt-24 space-y-5">
        <DocsSectionHeading
          eyebrow="QUICK HELP"
          title="Common questions & troubleshooting"
          description="Quick solutions to standard development and setup questions."
        />

        <Card className="divide-y divide-slate-100 overflow-hidden border-slate-200/90">
          {faqs.map((faq) => (
            <details key={faq.question} className="group p-4 transition-colors hover:bg-slate-50/50">
              <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-semibold text-slate-900 marker:none">
                <span>{faq.question}</span>
                <span className="text-slate-400 transition-transform group-open:rotate-180">
                  ▼
                </span>
              </summary>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">{faq.answer}</p>
            </details>
          ))}
        </Card>
      </section>

      {/* Ready to Test Callout */}
      <Card className="border-emerald-200/80 bg-gradient-to-r from-emerald-50 via-white to-emerald-50/30 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white shadow-sm shadow-emerald-600/30">
              <ListChecks className="size-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Ready to test the workflow?</h3>
              <p className="text-xs text-slate-600">
                Submit a live site audit on the client dashboard and monitor job execution in real-time.
              </p>
            </div>
          </div>
          <Button asChild className="shrink-0 bg-emerald-700 text-white hover:bg-emerald-800">
            <Link href="/">
              Start an audit
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>
      </Card>
    </>
  );
}

