import { timingSafeEqual } from "node:crypto";
import { parseAuditJobInput, type AuditJobInput } from "../../audits/validations/audit-input.validation";

const MAX_SCHEDULED_TARGETS = 30;

export function isScheduledAuditRequestAuthorized(authorization: string | undefined) {
  const secret = process.env.CRON_SECRET;
  if (!secret || !authorization) return false;
  const match = /^Bearer\s+(.+)$/i.exec(authorization);
  if (!match) return false;
  const provided = Buffer.from(match[1]);
  const expected = Buffer.from(secret);
  return provided.length === expected.length && timingSafeEqual(provided, expected);
}

export function parseScheduledTargets(raw: string | undefined): AuditJobInput[] {
  if (!raw?.trim()) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("SCHEDULED_AUDIT_TARGETS must be a valid JSON array.");
  }
  if (!Array.isArray(parsed)) throw new Error("SCHEDULED_AUDIT_TARGETS must be a JSON array.");
  if (parsed.length > MAX_SCHEDULED_TARGETS) {
    throw new Error(`SCHEDULED_AUDIT_TARGETS can contain at most ${MAX_SCHEDULED_TARGETS} entries.`);
  }

  return parsed.map((target, index) => {
    const result = parseAuditJobInput(target);
    if (typeof result === "string") {
      throw new Error(`Scheduled audit target ${index + 1} is invalid: ${result}`);
    }
    return result;
  });
}

export function getScheduledWindowKey(now: Date, interval: string) {
  if (interval === "2m" || interval === "5m") {
    const bucketMs = interval === "2m" ? 2 * 60_000 : 5 * 60_000;
    return String(Math.floor(now.getTime() / bucketMs));
  }
  if (interval === "hourly") return now.toISOString().slice(0, 13);
  if (interval === "daily") return now.toISOString().slice(0, 10);
  if (interval === "monthly") return now.toISOString().slice(0, 7);
  throw new Error("CRON_AUDIT_INTERVAL must be monthly, daily, hourly, 5m, or 2m.");
}
