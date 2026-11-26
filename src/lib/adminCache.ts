"use client";

/**
 * Ultra-fast client-side SWR cache + request deduplicator for Admin API calls.
 * Intercepts GET /api/admin/* calls cleanly when installed by AdminShell so:
 * - Hovering any Admin sidebar item preloads its JSON into RAM before the click finishes.
 * - Switching tabs renders data in ~0ms (instant) while revalidating silently in the background.
 * - Any POST/PUT/PATCH/DELETE immediately invalidates related cache entries so edits appear instantly.
 */

interface CacheEntry {
  text: string;
  status: number;
  contentType: string;
  ts: number;
}

const CACHE_TTL_MS = 45_000;
const STALE_REVALIDATE_MS = 6_000;

const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<CacheEntry>>();
let originalFetch: typeof window.fetch | null = null;
let installed = false;

function normalizeAdminUrl(input: RequestInfo | URL): string | null {
  if (typeof window === "undefined") return null;
  let urlStr = "";
  if (typeof input === "string") {
    urlStr = input;
  } else if (input instanceof URL) {
    urlStr = input.toString();
  } else if (typeof Request !== "undefined" && input instanceof Request) {
    urlStr = input.url;
  }
  if (!urlStr) return null;
  try {
    const parsed = new URL(urlStr, window.location.origin);
    if (parsed.origin !== window.location.origin) return null;
    if (!parsed.pathname.startsWith("/api/admin/")) return null;
    if (parsed.pathname.startsWith("/api/admin/export")) return null;
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return null;
  }
}

function buildResponse(entry: CacheEntry): Response {
  return new Response(entry.text, {
    status: entry.status,
    headers: { "Content-Type": entry.contentType || "application/json" },
  });
}

async function fetchAndStore(key: string): Promise<CacheEntry> {
  const existing = inflight.get(key);
  if (existing) return existing;

  const baseFetch = originalFetch || window.fetch.bind(window);
  const promise = (async () => {
    const res = await baseFetch(key, { credentials: "same-origin" });
    const text = await res.text();
    const entry: CacheEntry = {
      text,
      status: res.status,
      contentType: res.headers.get("content-type") || "application/json",
      ts: Date.now(),
    };
    if (res.ok) {
      cache.set(key, entry);
    }
    return entry;
  })();

  inflight.set(key, promise);
  try {
    return await promise;
  } finally {
    inflight.delete(key);
  }
}

export function invalidateAdminApiCache(pathPrefix?: string) {
  if (!pathPrefix) {
    cache.clear();
    return;
  }
  const basePath = pathPrefix.split("?")[0];
  for (const key of Array.from(cache.keys())) {
    if (
      key.startsWith(basePath) ||
      key.startsWith("/api/admin/dashboard") ||
      key.startsWith("/api/admin/logs")
    ) {
      cache.delete(key);
    }
  }
}

export function prefetchAdminApi(apiPath: string) {
  if (typeof window === "undefined" || !apiPath.startsWith("/api/admin/")) return;
  const cached = cache.get(apiPath);
  if (cached && Date.now() - cached.ts < STALE_REVALIDATE_MS) return;
  void fetchAndStore(apiPath).catch(() => {});
}

export function installAdminFetchCache(): () => void {
  if (typeof window === "undefined") return () => {};
  if (installed) return () => {};

  originalFetch = window.fetch.bind(window);
  installed = true;

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const baseFetch = originalFetch!;
    const key = normalizeAdminUrl(input);
    if (!key) {
      return baseFetch(input, init);
    }

    const method = (
      init?.method ||
      (typeof Request !== "undefined" && input instanceof Request ? input.method : "GET")
    ).toUpperCase();

    if (method === "GET") {
      const cached = cache.get(key);
      const now = Date.now();
      if (cached && now - cached.ts < CACHE_TTL_MS) {
        // Instant 0ms return; silently refresh in background if older than STALE_REVALIDATE_MS
        if (now - cached.ts > STALE_REVALIDATE_MS) {
          void fetchAndStore(key).catch(() => {});
        }
        return buildResponse(cached);
      }
      const fresh = await fetchAndStore(key);
      return buildResponse(fresh);
    }

    // Mutating call (POST/PUT/PATCH/DELETE): execute immediately, then invalidate cache so next load is 100% fresh
    const response = await baseFetch(input, init);
    if (response.ok) {
      invalidateAdminApiCache(key);
    }
    return response;
  };

  return () => {
    if (installed && originalFetch) {
      window.fetch = originalFetch;
      installed = false;
    }
  };
}
