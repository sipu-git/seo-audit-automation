import { ProviderNotConfiguredError } from "./provider-result.service";

export async function getKeywordRankings(businessType: string, city: string, state: string) {
  const username = process.env.DATAFORSEO_LOGIN?.trim();
  const password = process.env.DATAFORSEO_PASSWORD?.trim();
  if (!username || !password) {
    throw new ProviderNotConfiguredError("Set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD to enable keyword rankings.");
  }

  const credentials = Buffer.from(`${username}:${password}`).toString("base64");
  const response = await fetch("https://api.dataforseo.com/v3/serp/google/organic/live/advanced", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([{
      keyword: `${businessType} in ${city}`,
      location_name: `${city}, ${state}, India`,
      language_code: "en",
      device: "mobile",
    }]),
    signal: AbortSignal.timeout(60_000),
  });

  if (!response.ok) {
    throw new Error(`DataForSEO returned HTTP ${response.status}.`);
  }
  return response.json();
}
