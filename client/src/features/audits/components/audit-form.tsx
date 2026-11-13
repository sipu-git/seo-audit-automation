"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@apollo/client/react";
import { Icon } from "@/components/ui/icons";
import type { AuditInput } from "@/src/features/audits/types/audit-types";
import {
  CREATE_AUDIT_MUTATION,
  type CreateAuditMutationData,
  type CreateAuditMutationVariables,
} from "@/src/features/audits/api/audit-mutations";
import {
  auditFormSchema,
  type AuditFormValues,
} from "@/src/features/audits/validations/audit-form-schema";
import { extractGraphQLFieldErrors } from "@/src/shared/lib/validation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Heading2 } from "@/components/headings/Heading2";

export function AuditForm({ onQueued, compact = false }: {
  onQueued: (jobId: string, input: AuditInput) => void;
  compact?: boolean;
}) {
  const [error, setError] = useState("");
  const [createAudit, { loading: busy }] = useMutation<CreateAuditMutationData,
    CreateAuditMutationVariables
  >(CREATE_AUDIT_MUTATION);

  const form = useForm<AuditFormValues>({
    resolver: zodResolver(auditFormSchema),
    mode: "onChange",
    defaultValues: { url: "", businessType: "Dental clinic", city: "Pune", state: "Maharashtra" },
  });

  async function submit(values: AuditFormValues) {
    setError("");
    try {
      const { data } = await createAudit({ variables: { input: values } });
      if (!data) throw new Error("The audit request returned no result.");
      const queuedAudit = data.createAudit;
      onQueued(queuedAudit.jobId, values);
      form.setValue("url", "");
    } catch (reason) {
      const fieldErrors = extractGraphQLFieldErrors(reason);
      if (Object.keys(fieldErrors).length > 0) {
        for (const [key, msg] of Object.entries(fieldErrors)) {
          if (["url", "businessType", "city", "state"].includes(key)) {
            form.setError(key as keyof AuditFormValues, { message: msg });
          }
        }
      }
      setError(reason instanceof Error ? reason.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <Form {...form}>
      <form className="flex h-full flex-col" onSubmit={form.handleSubmit(submit)}>
        <Card
          className={`flex h-full flex-col justify-between rounded-[14px] border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm ${compact ? "h-auto border-0 bg-transparent p-0 shadow-none" : "max-[560px]:p-4"}`}
        >
          <div className={compact ? "mb-4 hidden items-center gap-3" : "mb-5 flex items-center gap-3"}>
            <span className="grid size-10 place-items-center rounded-xl border border-[var(--green-soft)] bg-[var(--green-soft)] text-[var(--green)] shadow-sm"><Icon name="globe" /></span>
            <div>
              <Heading2 text={compact ? "Queue a new audit" : "Start with a website"}/>
              <Heading2 text={compact ? "Add a site to the analysis queue." : "We’ll crawl the site, analyze its SEO signals, and prepare a prioritized report."}/>
            </div>
          </div>

          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem className="flex min-w-0 flex-col gap-1.5">
                <FormLabel className="block text-xs font-semibold text-[var(--ink)]">Website URL</FormLabel>
                <div className="relative mb-3.5">
                  <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[var(--muted)]"><Icon name="globe" /></span>
                  <FormControl>
                    <Input
                      className="h-11 pl-10 pr-3.5 text-[13px] font-medium placeholder:text-[13px] placeholder:text-[#98a79f]"
                      type="url"
                      placeholder="https://yourwebsite.com"
                      {...field}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className={compact ? "grid grid-cols-[1.15fr_.85fr_.9fr] gap-3 max-[780px]:grid-cols-1" : "grid grid-cols-[1.15fr_.85fr_.9fr] gap-3 max-[560px]:grid-cols-2"}>
            <FormField
              control={form.control}
              name="businessType"
              render={({ field }) => (
                <FormItem className="flex min-w-0 flex-col gap-1.5">
                  <FormLabel className="block text-xs font-semibold text-[var(--ink)]">Business type</FormLabel>
                  <FormControl>
                    <Input
                      className="text-[12.5px] font-medium placeholder:text-xs placeholder:text-[#98a79f]"
                      placeholder="e.g. Dental clinic"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem className="flex min-w-0 flex-col gap-1.5">
                  <FormLabel className="block text-xs font-semibold text-[var(--ink)]">City</FormLabel>
                  <FormControl>
                    <Input
                      className="text-[12.5px] font-medium placeholder:text-xs placeholder:text-[#98a79f]"
                      placeholder="e.g. Pune"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem className="flex min-w-0 flex-col gap-1.5">
                  <FormLabel className="block text-xs font-semibold text-[var(--ink)]">State</FormLabel>
                  <FormControl>
                    <Input
                      className="text-[12.5px] font-medium placeholder:text-xs placeholder:text-[#98a79f]"
                      placeholder="e.g. Maharashtra"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {error && <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-[10px] text-red-700" role="alert"><Icon name="alert" />{error}</div>}

          <Button
            className={`mt-4 h-10 rounded-[9px] px-4 text-xs font-bold shadow-md transition-transform hover:-translate-y-px ${compact ? "w-auto min-w-[170px] max-[780px]:w-full" : "w-full"}`}
            type="submit"
            disabled={busy}
          >
            {busy ? (
              <><span className="size-3.5 animate-spin rounded-full border-2 border-white/50 border-t-white" /> Adding to queue…</>
            ) : (
              <><Icon name="spark" /> Run SEO audit <Icon name="arrow" /></>
            )}
          </Button>

          {!compact && (
            <p className="mt-3 flex items-center gap-1.5 text-[9px] leading-relaxed text-[var(--muted)]">
              <Icon name="clock" /> Audits run in the background. You can keep working while we prepare your report.
            </p>
          )}
        </Card>
      </form>
    </Form>
  );
}
