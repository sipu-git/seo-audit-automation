import { fetchTextResource } from "./http";

type RobotsRule = { allow: boolean; path: string };
type RobotsGroup = { agents: string[]; rules: RobotsRule[] };

function parseRobotsFile(body: string) {
  const groups: RobotsGroup[] = [];
  const sitemaps: string[] = [];
  let group: RobotsGroup | null = null;
  let groupHasRules = false;

  for (const rawLine of body.split(/\r?\n/)) {
    const line = rawLine.split("#", 1)[0].trim();
    if (!line) continue;
    const separator = line.indexOf(":");
    if (separator < 0) continue;

    const directive = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();
    if (directive === "sitemap") {
      sitemaps.push(value);
      continue;
    }
    if (directive === "user-agent") {
      if (!group || groupHasRules) {
        group = { agents: [], rules: [] };
        groups.push(group);
        groupHasRules = false;
      }
      group.agents.push(value.toLowerCase());
      continue;
    }
    if (group && (directive === "allow" || directive === "disallow")) {
      groupHasRules = true;
      if (value) group.rules.push({ allow: directive === "allow", path: value });
    }
  }

  return { groups, sitemaps };
}

function selectRobotsRules(groups: RobotsGroup[], userAgent: string) {
  const agent = userAgent.toLowerCase();
  const matching = groups.flatMap((group) =>
    group.agents
      .map((name) => ({ group, name }))
      .filter(({ name }) => name === "*" || agent.includes(name)),
  );
  const specificity = Math.max(0, ...matching.map(({ name }) => name === "*" ? 0 : name.length));
  return matching
    .filter(({ name }) => (name === "*" ? 0 : name.length) === specificity)
    .flatMap(({ group }) => group.rules);
}

function pathPatternMatches(rulePath: string, requestPath: string) {
  const escaped = rulePath.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  const exact = escaped.endsWith("$");
  const source = exact ? escaped.slice(0, -1) : escaped;
  return new RegExp(`^${source}${exact ? "$" : ""}`).test(requestPath);
}

export function checkRobotsPermission(robots: { allowed: boolean | null; rules: RobotsRule[] }, target: URL) {
  if (!robots.rules.length) return { allowed: robots.allowed, matchedRule: null as string | null };

  const requestPath = `${target.pathname}${target.search}`;
  const matchingRules = robots.rules.filter((rule) => pathPatternMatches(rule.path, requestPath));
  matchingRules.sort((left, right) => {
    if (left.path.length !== right.path.length) return right.path.length - left.path.length;
    return Number(right.allow) - Number(left.allow);
  });
  const matched = matchingRules[0];
  return {
    allowed: matched ? matched.allow : true,
    matchedRule: matched ? `${matched.allow ? "Allow" : "Disallow"}: ${matched.path}` : null,
  };
}

export async function checkRobots(origin: string, pageUrl?: string) {
  const result = await fetchTextResource(new URL("/robots.txt", origin));
  const parsed = parseRobotsFile(result.body);
  const sitemapReferences = parsed.sitemaps.flatMap((location) => {
    try {
      const sitemapUrl = new URL(location, origin);
      return sitemapUrl.origin === origin ? [sitemapUrl.toString()] : [];
    } catch {
      return [];
    }
  });
  const rules = selectRobotsRules(parsed.groups, "SEO-Audit-Bot");
  const permission = pageUrl
    ? checkRobotsPermission({ allowed: result.available ? true : null, rules }, new URL(pageUrl))
    : { allowed: result.available ? true : null, matchedRule: null };

  return {
    url: result.url,
    available: result.available,
    status: result.status,
    error: result.error ?? null,
    crawlerAllowed: permission.allowed,
    matchedRule: permission.matchedRule,
    allowRules: rules.filter((rule) => rule.allow).map((rule) => `Allow: ${rule.path}`),
    disallowRules: rules.filter((rule) => !rule.allow).map((rule) => `Disallow: ${rule.path}`),
    sitemapReferences,
    // Internal rules are used to check each URL during the crawl. Keep them out of the report payload.
    _rules: rules,
  };
}
