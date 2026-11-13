import type { Request, Response } from "express";
import { downloadAuditReport } from "../services/audit-report.service";
import { verifyAccessToken, verifyRefreshToken, setAccessCookie, clearAuthCookies } from "../../auth/services/auth-token.service.js";
import { authService } from "../../auth/services/auth.service.js";
import { getUserRole } from "../../auth/services/authorization.service.js";
import { prisma } from "../../../db/client.js";

function readCookie(request: Request, name: string) {
  const entry = request.headers.cookie?.split(";").find((part) => part.trim().startsWith(`${name}=`));
  return entry?.slice(entry.indexOf("=") + 1).trim() ?? null;
}

export async function getAuditReportController(request: Request, response: Response) {
  try {
    const accessToken = readCookie(request, "accessToken");
    const refreshToken = readCookie(request, "refreshToken");
    const userId = (accessToken ? verifyAccessToken(accessToken) : null) ??
      (refreshToken ? verifyRefreshToken(refreshToken) : null);
    const user = userId ? await authService.findPublicAuthById(userId) : null;
    if (!user) {
      if (accessToken || refreshToken) clearAuthCookies(response);
      response.status(401).json({ error: "Sign in to download this report." });
      return;
    }
    if ((!accessToken || !verifyAccessToken(accessToken)) && refreshToken) {
      setAccessCookie(response, user.id);
    }

    const audit = await prisma.audit.findUnique({ where: { jobId: request.params.jobId }, select: { created_by: true } });
    if (!audit) {
      response.status(404).json({ error: "Audit report not found." });
      return;
    }
    if (getUserRole(user) !== "ADMIN" && audit.created_by !== user.id) {
      response.status(403).json({ error: "You cannot access this report." });
      return;
    }

    const report = await downloadAuditReport(request.params.jobId);
    if (report.kind === "not_found") {
      response.status(404).json({ error: "Audit report not found." });
      return;
    }
    if (report.kind === "not_ready") {
      response.status(409).json({ error: "The PDF report is not ready yet. Wait for the audit to complete, then try again." });
      return;
    }
    response.setHeader("Cache-Control", "private, no-store");
    if (report.kind === "redirect") {
      response.redirect(302, report.url);
      return;
    }

    const safeJobId = request.params.jobId.replace(/[^a-zA-Z0-9_-]/g, "_");
    response.status(200).set({
      "Content-Type": "application/pdf",
      "Content-Length": String(report.pdf.byteLength),
      "Content-Disposition": `attachment; filename="seo-audit-${safeJobId}.pdf"`,
    }).send(report.pdf);
  } catch (error) {
    console.error("Unable to deliver the audit PDF report:", error);
    response.status(503).json({ error: "Unable to download the PDF report." });
  }
}
