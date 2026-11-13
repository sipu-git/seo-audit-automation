import type { Request, Response } from "express";
import { enqueueScheduledAudits } from "../services/scheduled-audits.service";
import {
  getScheduledWindowKey,
  isScheduledAuditRequestAuthorized,
  parseScheduledTargets,
} from "../validations/scheduled-audits.validation";

export async function enqueueScheduledAuditsController(request: Request, response: Response) {
  if (!process.env.CRON_SECRET) {
    response.status(503).json({ error: "Scheduled audit endpoint is not configured." });
    return;
  }
  if (!isScheduledAuditRequestAuthorized(request.headers.authorization)) {
    response.status(401).json({ error: "Unauthorized." });
    return;
  }

  let targets;
  let interval: string;
  let windowKey: string;
  try {
    targets = parseScheduledTargets(process.env.SCHEDULED_AUDIT_TARGETS);
    interval = process.env.CRON_AUDIT_INTERVAL?.trim() || "monthly";
    windowKey = getScheduledWindowKey(new Date(), interval);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Scheduled audit configuration is invalid.";
    response.status(500).json({ error: message });
    return;
  }
  if (targets.length === 0) {
    response.status(409).json({ error: "No scheduled audit targets are configured." });
    return;
  }

  try {
    const jobs = await enqueueScheduledAudits(targets, interval, windowKey);
    response.status(202).json({ status: "queued", interval, queuedCount: jobs.length, jobs });
  } catch (error) {
    console.error("Unable to enqueue scheduled audits:", error);
    response.status(503).json({ error: "Unable to queue scheduled audits." });
  }
}
