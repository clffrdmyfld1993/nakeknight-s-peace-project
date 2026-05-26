// Google Search Console — Index Coverage via URL Inspection API.
// Reads sitemap.xml, inspects each URL, aggregates verdicts.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SITE_URL = "https://herodossier.lovable.app/";
const SITEMAP_URL = "https://herodossier.lovable.app/sitemap.xml";
const GATEWAY = "https://connector-gateway.lovable.dev/google_search_console";

interface InspectionResult {
  url: string;
  verdict: string; // PASS | PARTIAL | FAIL | NEUTRAL | VERDICT_UNSPECIFIED
  coverageState: string;
  indexingState: string;
  lastCrawlTime?: string;
  pageFetchState?: string;
  robotsTxtState?: string;
  googleCanonical?: string;
  userCanonical?: string;
  referringUrls?: string[];
  sitemap?: string[];
  error?: string;
}

async function fetchSitemapUrls(): Promise<string[]> {
  const res = await fetch(SITEMAP_URL);
  if (!res.ok) throw new Error(`Sitemap fetch failed: ${res.status}`);
  const xml = await res.text();
  return Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1].trim());
}

async function inspectUrl(
  url: string,
  lovableKey: string,
  gscKey: string,
): Promise<InspectionResult> {
  const res = await fetch(`${GATEWAY}/v1/urlInspection/index:inspect`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": gscKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inspectionUrl: url,
      siteUrl: SITE_URL,
      languageCode: "en-US",
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    return {
      url,
      verdict: "ERROR",
      coverageState: "Error",
      indexingState: "Error",
      error: data?.error?.message ?? `HTTP ${res.status}`,
    };
  }
  const idx = data?.inspectionResult?.indexStatusResult ?? {};
  return {
    url,
    verdict: idx.verdict ?? "VERDICT_UNSPECIFIED",
    coverageState: idx.coverageState ?? "Unknown",
    indexingState: idx.indexingState ?? "Unknown",
    lastCrawlTime: idx.lastCrawlTime,
    pageFetchState: idx.pageFetchState,
    robotsTxtState: idx.robotsTxtState,
    googleCanonical: idx.googleCanonical,
    userCanonical: idx.userCanonical,
    referringUrls: idx.referringUrls,
    sitemap: idx.sitemap,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const GSC_KEY = Deno.env.get("GOOGLE_SEARCH_CONSOLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
    if (!GSC_KEY) throw new Error("GOOGLE_SEARCH_CONSOLE_API_KEY is not configured");

    const urls = await fetchSitemapUrls();

    // Inspect with limited concurrency to be polite.
    const results: InspectionResult[] = [];
    const concurrency = 3;
    let i = 0;
    async function worker() {
      while (i < urls.length) {
        const my = i++;
        results[my] = await inspectUrl(urls[my], LOVABLE_API_KEY, GSC_KEY);
      }
    }
    await Promise.all(Array.from({ length: Math.min(concurrency, urls.length) }, worker));

    // Aggregate.
    const summary = {
      total: results.length,
      valid: 0, // PASS
      partial: 0, // PARTIAL
      invalid: 0, // FAIL
      neutral: 0, // NEUTRAL
      error: 0,
    };
    const issues: Record<string, number> = {};
    for (const r of results) {
      if (r.verdict === "PASS") summary.valid++;
      else if (r.verdict === "PARTIAL") summary.partial++;
      else if (r.verdict === "FAIL") summary.invalid++;
      else if (r.verdict === "NEUTRAL") summary.neutral++;
      else summary.error++;
      const key = r.coverageState || "Unknown";
      issues[key] = (issues[key] ?? 0) + 1;
    }

    return new Response(
      JSON.stringify({
        siteUrl: SITE_URL,
        checkedAt: new Date().toISOString(),
        summary,
        issues,
        results,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
