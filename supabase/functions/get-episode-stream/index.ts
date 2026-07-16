// Returns a short-lived signed URL for an episode's audio.
// Auth required (JWT verified). Rate-limited per user.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// naive in-memory rate limiter (per-instance)
const buckets = new Map<string, { count: number; resetAt: number }>();
const LIMIT = 10;
const WINDOW_MS = 60_000;

function rateLimit(key: string): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (b.count >= LIMIT) return false;
  b.count++;
  return true;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return json({ error: "Unauthorized" }, 401);
  }

  const sbAuth = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const token = authHeader.replace("Bearer ", "");
  const { data: claimsData, error: claimsErr } = await sbAuth.auth.getClaims(token);
  if (claimsErr || !claimsData?.claims) return json({ error: "Unauthorized" }, 401);
  const userId = claimsData.claims.sub as string;

  if (!rateLimit(userId)) return json({ error: "Rate limit exceeded" }, 429);

  let body: { episode_id?: string } = {};
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }
  if (!body.episode_id || typeof body.episode_id !== "string") {
    return json({ error: "episode_id required" }, 400);
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const { data: ep, error } = await admin
    .from("weekly_serials")
    .select("id, audio_url, is_premium, is_published, status")
    .eq("id", body.episode_id)
    .maybeSingle();
  if (error || !ep) return json({ error: "Not found" }, 404);
  if (!ep.is_published || !["published", "archived"].includes(ep.status)) {
    return json({ error: "Not available" }, 403);
  }
  if (!ep.audio_url) return json({ error: "No audio for this episode" }, 404);
  // NOTE: premium purchase enforcement happens in the existing fulfill-purchase flow
  // which grants a signed URL directly; this endpoint serves free/current episodes only.
  if (ep.is_premium) return json({ error: "Premium episodes are delivered via fulfillment" }, 403);

  const { data: signed, error: signErr } = await admin.storage
    .from("chronicles")
    .createSignedUrl(ep.audio_url, 60 * 60); // 60 minutes
  if (signErr || !signed) return json({ error: "Signing failed" }, 500);

  return json({ url: signed.signedUrl, expires_in: 3600 });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
