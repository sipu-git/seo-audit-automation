import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { Agent, fetch as undiciFetch, type Response as UndiciResponse } from "undici";

export const CRAWLER_USER_AGENT = "SEO-Audit-Bot/1.0";

const MAX_REDIRECTS = 5;
const DEFAULT_MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_PORTS = new Set(["", "80", "443"]);

export type SafeFetchResult = {
  url: string;
  status: number;
  headers: UndiciResponse["headers"];
  body: string;
};

export type TextResourceResult = {
  url: string;
  status: number | null;
  available: boolean;
  body: string;
  error?: string;
};

function isPublicIpv4(address: string) {
  const parts = address.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return false;
  }

  const [a, b, c] = parts;
  if (a === 0 || a === 10 || a === 127 || a >= 224) return false;
  if (a === 100 && b >= 64 && b <= 127) return false;
  if (a === 169 && b === 254) return false;
  if (a === 172 && b >= 16 && b <= 31) return false;
  if (a === 192 && b === 168) return false;
  if (a === 192 && b === 0 && (c === 0 || c === 2)) return false;
  if (a === 192 && b === 88 && c === 99) return false;
  if (a === 192 && b === 31 && c === 196) return false;
  if (a === 192 && b === 52 && c === 193) return false;
  if (a === 192 && b === 175 && c === 48) return false;
  if (a === 198 && (b === 18 || b === 19)) return false;
  if (a === 198 && b === 51 && c === 100) return false;
  if (a === 203 && b === 0 && c === 113) return false;
  return true;
}

function ipv6ToGroups(address: string): string[] | null {
  const normalized = address.toLowerCase().split("%")[0];
  const ipv4Match = normalized.match(/(?:^|:)(\d+\.\d+\.\d+\.\d+)$/);
  let source = normalized;
  if (ipv4Match) {
    if (!isPublicIpv4(ipv4Match[1])) return null;
    const octets = ipv4Match[1].split(".").map(Number);
    const high = ((octets[0] << 8) | octets[1]).toString(16);
    const low = ((octets[2] << 8) | octets[3]).toString(16);
    source = `${normalized.slice(0, normalized.length - ipv4Match[1].length)}${high}:${low}`;
  }

  const halves = source.split("::");
  if (halves.length > 2) return null;
  const left = halves[0] ? halves[0].split(":") : [];
  const right = halves[1] ? halves[1].split(":") : [];
  const missing = 8 - left.length - right.length;
  if (missing < 0 || (halves.length === 1 && missing !== 0)) return null;
  const groups = [...left, ...Array(missing).fill("0"), ...right];
  if (groups.length !== 8 || groups.some((group) => !/^[0-9a-f]{1,4}$/.test(group))) return null;

  return groups.map((group) => group.padStart(4, "0"));
}

function isPublicIp(address: string) {
  const family = isIP(address);
  if (family === 4) return isPublicIpv4(address);
  if (family !== 6) return false;

  const groups = ipv6ToGroups(address);
  if (groups === null) return false;

  // Only globally routable IPv6 unicast space is allowed. Exclude documentation,
  // 6to4, and protocol-assignment ranges that can encapsulate non-public hosts.
  const firstGroup = Number.parseInt(groups[0], 16);
  const secondGroup = Number.parseInt(groups[1], 16);
  if (firstGroup < 0x2000 || firstGroup > 0x3fff) return false; // 2000::/3
  if (firstGroup === 0x2002) return false; // 6to4
  if (firstGroup === 0x2001 && (secondGroup <= 0x01ff || secondGroup === 0x0db8)) return false;
  return true;
}

function normalizedHostname(url: URL) {
  return url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
}

function assertPublicHttpUrl(url: URL) {
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only http and https URLs can be crawled.");
  }
  if (url.username || url.password) {
    throw new Error("URLs with embedded credentials cannot be crawled.");
  }
  if (!ALLOWED_PORTS.has(url.port)) {
    throw new Error("Only standard HTTP and HTTPS ports can be crawled.");
  }

  const hostname = normalizedHostname(url);
  if (!hostname || hostname === "localhost" || hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") || hostname.endsWith(".internal") ||
    hostname.endsWith(".test") || hostname.endsWith(".home.arpa")) {
    throw new Error("Private or local network hosts cannot be crawled.");
  }
}

async function resolvePublicAddresses(url: URL) {
  assertPublicHttpUrl(url);
  const hostname = normalizedHostname(url);
  const family = isIP(hostname);
  const addresses = family
    ? [{ address: hostname, family }]
    : await lookup(hostname, { all: true, verbatim: true });

  if (addresses.length === 0 || addresses.some(({ address }) => !isPublicIp(address))) {
    throw new Error("The website resolves to a non-public IP address and cannot be crawled.");
  }

  return addresses;
}

function createPinnedLookup(addresses: Awaited<ReturnType<typeof resolvePublicAddresses>>) {
  return ((hostname: string, options: { all?: boolean }, callback: (...args: unknown[]) => void) => {
    if (!addresses.length) {
      callback(new Error("No public address is available for this host."));
      return;
    }
    if (options?.all) {
      callback(null, addresses);
      return;
    }
    callback(null, addresses[0].address, addresses[0].family);
  }) as never;
}

async function readTextBody(response: Pick<UndiciResponse, "body">, maxBytes: number) {
  if (!response.body) return "";
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        throw new Error(`The website response exceeds the ${Math.floor(maxBytes / 1024)} KB crawl limit.`);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const result = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(result);
}

export async function fetchPublicText(
  inputUrl: URL,
  options: { timeoutMs?: number; maxBytes?: number } = {},
): Promise<SafeFetchResult> {
  let currentUrl = new URL(inputUrl);
  const timeoutMs = options.timeoutMs ?? 10_000;
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
    const addresses = await resolvePublicAddresses(currentUrl);
    const dispatcher = new Agent({ connect: { lookup: createPinnedLookup(addresses) } });
    let response: UndiciResponse;
    try {
      response = await undiciFetch(currentUrl, {
        headers: { "User-Agent": CRAWLER_USER_AGENT },
        redirect: "manual",
        signal: AbortSignal.timeout(timeoutMs),
        dispatcher,
      });

      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get("location");
        await response.body?.cancel();
        if (!location) {
          return { url: currentUrl.toString(), status: response.status, headers: response.headers, body: "" };
        }
        if (redirectCount === MAX_REDIRECTS) {
          throw new Error("The website exceeded the allowed redirect limit.");
        }
        currentUrl = new URL(location, currentUrl);
        assertPublicHttpUrl(currentUrl);
        continue;
      }

      const body = response.ok ? await readTextBody(response, maxBytes) : "";
      return { url: currentUrl.toString(), status: response.status, headers: response.headers, body };
    } finally {
      await dispatcher.close();
    }
  }

  throw new Error("The website exceeded the allowed redirect limit.");
}

export async function fetchTextResource(resourceUrl: URL): Promise<TextResourceResult> {
  try {
    const response = await fetchPublicText(resourceUrl, { timeoutMs: 10_000, maxBytes: 1024 * 1024 });
    return {
      url: response.url,
      status: response.status,
      available: response.status >= 200 && response.status < 300,
      body: response.body,
    };
  } catch (error) {
    return {
      url: resourceUrl.toString(),
      status: null,
      available: false,
      body: "",
      error: error instanceof Error ? error.message : "Request failed.",
    };
  }
}
