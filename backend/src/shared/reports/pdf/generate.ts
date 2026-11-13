import { buildAuditReportHtml } from "../html/document";
import type { AuditPdfData } from "../types";
import { renderHtmlToPdf } from "./browser";

export async function generateAuditPdf(data: AuditPdfData): Promise<Buffer> {
  const html = buildAuditReportHtml(data);
  return renderHtmlToPdf(html);
}
