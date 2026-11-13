import { load } from "cheerio";
import { fetchPublicText } from "./http";
import { validateJsonLd } from "./schema-validation";

export async function fetchAndParsePage(inputUrl: string) {
  const requestedUrl = new URL(inputUrl);
  const response = await fetchPublicText(requestedUrl, {
    timeoutMs: 15_000,
    maxBytes: 2 * 1024 * 1024,
  });

  if (response.status < 200 || response.status >= 300) {
    throw new Error(`Website returned an HTTP ${response.status}.`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("text/html")) {
    throw new Error("The URL did not return an HTML page.");
  }

  const $ = load(response.body);
  const schema = $('script[type="application/ld+json"]')
    .slice(0, 5)
    .map((_, element) => {
      const raw = $(element).text().trim();
      if (raw.length > 5000) {
        return { invalidJsonLd: true, truncated: true, raw: raw.slice(0, 1000) };
      }
      try {
        return JSON.parse(raw);
      } catch {
        return { invalidJsonLd: true, raw: raw.slice(0, 1000) };
      }
    })
    .get();
  const canonicalHref = $('link[rel="canonical"]').attr("href");
  let canonical: string | null = null;
  if (canonicalHref) {
    try {
      const canonicalUrl = new URL(canonicalHref, response.url);
      if (canonicalUrl.protocol === "http:" || canonicalUrl.protocol === "https:") {
        canonical = canonicalUrl.toString();
      }
    } catch {
      canonical = null;
    }
  }

  const links = $("a[href]")
    .map((_, element) => {
      try {
        const link = new URL($(element).attr("href") ?? "", response.url);
        return link.protocol === "http:" || link.protocol === "https:" ? link.toString() : null;
      } catch {
        return null;
      }
    })
    .get()
    .filter((href): href is string => Boolean(href));

  return {
    requestedUrl: inputUrl,
    finalUrl: response.url,
    status: response.status,
    title: $("title").first().text().trim().slice(0, 500),
    metaDescription: $('meta[name="description"]').attr("content")?.trim().slice(0, 2000) ?? "",
    headings: {
      h1: $("h1").map((_, element) => $(element).text().trim()).get().filter(Boolean).slice(0, 20),
      h2: $("h2").map((_, element) => $(element).text().trim()).get().filter(Boolean).slice(0, 50),
    },
    links: Array.from(new Set(links)).slice(0, 200),
    imagesMissingAlt: $("img").filter((_, element) => $(element).attr("alt") === undefined).length,
    canonical,
    schema,
    schemaValidation: validateJsonLd(schema),
  };
}
