import { ProviderNotConfiguredError } from "./provider-result.service";

export async function getSearchConsoleData(url: string) {
  const accessToken = process.env.GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN?.trim();
  if (!accessToken) {
    throw new ProviderNotConfiguredError("Set GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN to enable Search Console data.");
  }

  const property = process.env.GOOGLE_SEARCH_CONSOLE_PROPERTY?.trim() || new URL(url).origin;
  const endpoint = new URL(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(property)}/searchAnalytics/query`,
  );
  const endDate = new Date();
  endDate.setUTCDate(endDate.getUTCDate() - 1);
  const startDate = new Date(endDate);
  startDate.setUTCDate(startDate.getUTCDate() - 27);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      startDate: startDate.toISOString().slice(0, 10),
      endDate: endDate.toISOString().slice(0, 10),
      dimensions: ["query"],
      rowLimit: 25,
      dataState: "final",
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    throw new Error(`Google Search Console returned HTTP ${response.status}.`);
  }
  return response.json();
}
