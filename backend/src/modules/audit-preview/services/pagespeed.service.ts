export async function getPageSpeedData(url: string) {
  const endpoint = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
  endpoint.searchParams.set("url", url);
  endpoint.searchParams.set("strategy", "mobile");
  for (const category of ["PERFORMANCE", "SEO", "ACCESSIBILITY", "BEST_PRACTICES"]) {
    endpoint.searchParams.append("category", category);
  }

  const apiKey = process.env.PAGESPEED_API_KEY?.trim();
  if (apiKey) endpoint.searchParams.set("key", apiKey);

  const response = await fetch(endpoint, { signal: AbortSignal.timeout(90_000) });
  if (!response.ok) {
    throw new Error(`PageSpeed Insights returned HTTP ${response.status}.`);
  }
  return response.json();
}
