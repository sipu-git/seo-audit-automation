import { load } from "cheerio";
import { fetchTextResource } from "./http";

const MAX_SITEMAPS_TO_CHECK = 5;
const MAX_DISCOVERED_URLS = 250;

export type SitemapCheck = {
  url: string;
  available: boolean;
  status: number | null;
  error: string | null;
  validXml: boolean;
  type: "urlset" | "index" | "unknown";
  urlCount: number;
  childSitemapCount: number;
  pageUrls: string[];
  sitemapReferences: string[];
};

function readLocations(xml: string) {
  const $ = load(xml, { xmlMode: true });
  return $("loc")
    .map((_, element) => $(element).text().trim())
    .get()
    .filter(Boolean);
}

function sameOriginUrl(value: string, baseUrl: string, expectedOrigin: string) {
  try {
    const parsed = new URL(value, baseUrl);
    if ((parsed.protocol !== "http:" && parsed.protocol !== "https:") || parsed.origin !== expectedOrigin) {
      return null;
    }
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return null;
  }
}

export async function checkSitemaps(sitemapReferences: string[], origin: string): Promise<SitemapCheck[]> {
  const expectedOrigin = new URL(origin).origin;
  const initialReferences = sitemapReferences.length > 0
    ? sitemapReferences
    : [new URL("/sitemap.xml", expectedOrigin).toString()];
  const queue = initialReferences
    .map((reference) => sameOriginUrl(reference, expectedOrigin, expectedOrigin))
    .filter((reference): reference is string => Boolean(reference));
  const visited = new Set<string>();
  const results: SitemapCheck[] = [];
  const discoveredPageUrls = new Set<string>();

  while (queue.length > 0 && results.length < MAX_SITEMAPS_TO_CHECK) {
    const sitemapUrl = queue.shift()!;
    if (visited.has(sitemapUrl)) continue;
    visited.add(sitemapUrl);

    const response = await fetchTextResource(new URL(sitemapUrl));
    const xmlLooksValid = response.available && /^\uFEFF?\s*<\??xml|^\uFEFF?\s*<(?:\w+:)?(?:urlset|sitemapindex)\b/i.test(response.body);
    const $ = load(response.body, { xmlMode: true });
    const isIndex = $("sitemapindex").length > 0 || /<(?:\w+:)?sitemapindex\b/i.test(response.body);
    const isUrlSet = $("urlset").length > 0 || /<(?:\w+:)?urlset\b/i.test(response.body);
    const locations = response.available ? readLocations(response.body) : [];
    const pageUrls: string[] = [];
    const childSitemaps: string[] = [];

    if (response.available) {
      for (const location of locations) {
        const normalized = sameOriginUrl(location, response.url, expectedOrigin);
        if (!normalized) continue;
        if (isIndex) {
          childSitemaps.push(normalized);
          if (queue.length + visited.size < MAX_SITEMAPS_TO_CHECK) queue.push(normalized);
        } else if (isUrlSet && discoveredPageUrls.size < MAX_DISCOVERED_URLS) {
          discoveredPageUrls.add(normalized);
          pageUrls.push(normalized);
        }
      }
    }

    results.push({
      url: response.url,
      available: response.available,
      status: response.status,
      error: response.error ?? null,
      validXml: xmlLooksValid && (isIndex || isUrlSet),
      type: isIndex ? "index" : isUrlSet ? "urlset" : "unknown",
      urlCount: isUrlSet ? pageUrls.length : 0,
      childSitemapCount: childSitemaps.length,
      pageUrls: pageUrls.slice(0, MAX_DISCOVERED_URLS),
      sitemapReferences: childSitemaps.slice(0, MAX_SITEMAPS_TO_CHECK),
    });
  }

  if (queue.length > 0 && results.length >= MAX_SITEMAPS_TO_CHECK) {
    results[results.length - 1].error ??= `Sitemap checks were capped at ${MAX_SITEMAPS_TO_CHECK} files.`;
  }

  return results;
}
