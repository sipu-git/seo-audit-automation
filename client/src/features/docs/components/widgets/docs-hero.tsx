import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function DocsHero() {
  return (
    <Card className="relative overflow-hidden border-emerald-200/70 bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/20 shadow-sm">
      <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-emerald-200/30 blur-3xl pointer-events-none" />
      <CardContent className="relative flex flex-col gap-6 p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
          <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
            <BookOpen className="size-6" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="border-emerald-300 bg-white/80 font-mono text-[11px] text-emerald-800"
              >
                v1.0 Architecture & Reference
              </Badge>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Start here
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
              This workspace accepts any business website URL, crawls the HTML, analyzes on-page
              signals with Google Gemini in a background worker, and delivers structured audits and
              downloadable PDF reports.
            </p>
          </div>
        </div>

        <Separator className="bg-emerald-100" />

        <div className="flex flex-wrap items-center gap-3">
          <Button asChild className="bg-emerald-700 text-white shadow-sm hover:bg-emerald-800">
            <Link href="/">
              Client dashboard
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
