import { fetchAndParsePage } from "./page";
import { checkRobots, checkRobotsPermission } from "./robots";
import { checkSitemaps } from "./sitemap";

const EMPTY_SCHEMA_VALIDATION = {
  validator: "local-jsonld" as const,
  valid: false,
  itemCount: 0,
  errors: [],
  warnings: ["Page was not crawled."],
};

function getPageLimit() {
  const configured = Number(process.env.CRAWL_MAX_PAGES ?? 8);
  return Number.isFinite(configured) ? Math.min(25, Math.max(1, Math.floor(configured))) : 8;
}

function compactPage(page: Awaited<ReturnType<typeof fetchAndParsePage>>) {
  return {
    url: page.finalUrl,
    status: page.status,
    title: page.title,
    metaDescription: page.metaDescription,
    headings: page.headings,
    imagesMissingAlt: page.imagesMissingAlt,
    canonical: page.canonical,
    schema: page.schema,
    schemaValidation: page.schemaValidation,
  };
}

export async function crawlPage(inputUrl: string) {
  const requestedUrl = new URL(inputUrl);
  const requestedOrigin = requestedUrl.origin;
  const requestedRobots = await checkRobots(requestedOrigin, requestedUrl.toString());
  const requestedPermission = requestedRobots.crawlerAllowed;

  if (requestedPermission === false) {
    const { _rules: _requestedRules, ...robots } = requestedRobots;
    const sitemaps = await checkSitemaps(robots.sitemapReferences, requestedOrigin);
    return {
      requestedUrl: inputUrl,
      finalUrl: requestedUrl.toString(),
      status: null,
      title: "",
      metaDescription: "",
      headings: { h1: [] as string[], h2: [] as string[] },
      links: [] as string[],
      imagesMissingAlt: 0,
      canonical: null,
      schema: [] as unknown[],
      schemaValidation: { ...EMPTY_SCHEMA_VALIDATION, warnings: ["Crawling was skipped because robots.txt disallows this URL."] },
      robots,
      sitemaps,
      pages: [] as ReturnType<typeof compactPage>[],
      pagesCrawled: 0,
      crawlErrors: ["The requested URL is disallowed by robots.txt for SEO-Audit-Bot."],
    };
  }

  const home = await fetchAndParsePage(inputUrl);
  const finalOrigin = new URL(home.finalUrl).origin;
  const robots = finalOrigin === requestedOrigin
    ? requestedRobots
    : await checkRobots(finalOrigin, home.finalUrl);
  const { _rules: robotsRules, ...publicRobots } = robots;
  const sitemaps = await checkSitemaps(publicRobots.sitemapReferences, finalOrigin);
  const maxPages = getPageLimit();
  const pages = [home];
  const crawlErrors: string[] = [];
  const queue = new Set<string>();

  for (const sitemap of sitemaps) {
    for (const url of sitemap.pageUrls) queue.add(url);
  }
  for (const link of home.links) {
    try {
      const parsed = new URL(link);
      if (parsed.origin === finalOrigin) queue.add(parsed.toString());
    } catch {
      // Invalid links were already omitted by the page parser.
    }
  }

  const crawled = new Set([new URL(home.finalUrl).toString()]);
  let pagesAttempted = 1;
  for (const url of Array.from(queue)) {
    if (pagesAttempted >= maxPages) break;
    const parsed = new URL(url);
    if (parsed.origin !== finalOrigin || crawled.has(parsed.toString())) continue;
    crawled.add(parsed.toString());
    pagesAttempted += 1;
    const permission = checkRobotsPermission(
      { allowed: robots.crawlerAllowed, rules: robots._rules },
      parsed,
    );
    if (permission.allowed === false) {
      crawlErrors.push(`${parsed.pathname} skipped by robots.txt (${permission.matchedRule ?? "disallowed"}).`);
      continue;
    }

    try {
      pages.push(await fetchAndParsePage(parsed.toString()));
    } catch (error) {
      crawlErrors.push(`${parsed.pathname}: ${error instanceof Error ? error.message : "Page crawl failed."}`);
    }
  }

  const { _rules: _robotsRules, ...cleanRobots } = robots;
  const mainPage = compactPage(home);

  return {
    ...home,
    robots: cleanRobots,
    sitemaps,
    pages: pages.map(compactPage),
    pagesCrawled: pages.length,
    crawlErrors: crawlErrors.slice(0, 50),
    siteSummary: {
      pagesConsidered: pagesAttempted,
      pageLimit: maxPages,
      pagesWithMissingTitles: pages.filter((page) => !page.title).length,
      pagesWithMissingMetaDescriptions: pages.filter((page) => !page.metaDescription).length,
      pagesWithMissingH1: pages.filter((page) => page.headings.h1.length === 0).length,
      pagesWithSchemaErrors: pages.filter((page) => !page.schemaValidation.valid && page.schema.length > 0).length,
      pagesWithMissingSchema: pages.filter((page) => page.schema.length === 0).length,
    },
    homePage: mainPage,
  };
}
