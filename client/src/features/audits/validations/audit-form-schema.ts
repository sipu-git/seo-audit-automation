import { z } from "zod";
import { trimmedStringRule, urlRule } from "@/src/shared/lib/validation";

export const auditFormSchema = z.object({
  url: urlRule,
  businessType: trimmedStringRule("Business type", 120),
  city: trimmedStringRule("City", 120),
  state: trimmedStringRule("State", 120),
});

export type AuditFormValues = z.infer<typeof auditFormSchema>;
