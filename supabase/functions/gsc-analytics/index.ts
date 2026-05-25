// Google Search Console analytics proxy
// Calls searchAnalytics/query through the Lovable connector gateway.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SITE_URL = "https://herodossier.lovable.app/";
const GATEWAY = "https://connector-gateway.lovable.dev/google_search_console/webmasters/v3";

interface Body {
  startDate?: string;
  endDate?: string;
  dimensions?: string[]; // e.g. ["date"], ["query"], ["page"]
  rowLimit?: number;
}

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const GSC_KEY = Deno.env.get("GOOGLE_SEARCH_CONSOLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
    if (!GSC_KEY) throw new Error("GOOGLE_SEARCH_CONSOLE_API_KEY is not configured");

    const body: Body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const startDate = body.startDate ?? isoDaysAgo(28);
    const endDate = body.endDate ?? isoDaysAgo(1);
    const dimensions = Array.isArray(body.dimensions) && body.dimensions.length > 0 ? body.dimensions : ["date"];
    const rowLimit = Math.min(Math.max(body.rowLimit ?? 1000, 1), 25000);

    const site = encodeURIComponent(SITE_URL);
    const url = `${GATEWAY}/sites/${site}/searchAnalytics/query`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": GSC_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ startDate, endDate, dimensions, rowLimit }),
    });

    const data = await res.json();
    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: "GSC API failed", status: res.status, details: data }),
        { status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ startDate, endDate, dimensions, rows: data.rows ?? [] }),
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
