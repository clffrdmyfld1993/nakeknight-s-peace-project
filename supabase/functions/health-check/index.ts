// Stack health probe: DB, storage, AI gateway, TTS endpoint, Stripe.
// Admin-token gated. Logs degradation to automation_logs and fires the alert webhook.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-admin-token",
};

interface Check {
  name: string;
  status: "ok" | "degraded" | "skipped";
  detail: string;
  duration_ms: number;
}

async function timed(name: string, fn: () => Promise<string>): Promise<Check> {
  const t0 = Date.now();
  try {
    const detail = await fn();
    return { name, status: "ok", detail, duration_ms: Date.now() - t0 };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === "__skip__") {
      return { name, status: "skipped", detail: "not configured", duration_ms: Date.now() - t0 };
    }
    return { name, status: "degraded", detail: msg, duration_ms: Date.now() - t0 };
  }
}

async function notifyAlert(message: string) {
  const hook = Deno.env.get("AUTOMATION_ALERT_WEBHOOK");
  if (!hook) return;
  try {
    await fetch(hook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_type: "health_degraded",
        message: `[NakedKnights] ${message}`,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (e) {
    console.error("alert webhook failed", e);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const adminToken = Deno.env.get("ADMIN_TOKEN");
  if (!adminToken || req.headers.get("x-admin-token") !== adminToken) {
    return json({ error: "Unauthorized" }, 401);
  }

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const checks: Check[] = [];

  checks.push(
    await timed("database", async () => {
      const { count, error } = await sb
        .from("weekly_serials")
        .select("id", { count: "exact", head: true });
      if (error) throw new Error(error.message);
      return `${count ?? 0} episodes`;
    }),
  );

  checks.push(
    await timed("storage:chronicles", async () => {
      const { data, error } = await sb.storage.from("chronicles").list("episodes", { limit: 1 });
      if (error) throw new Error(error.message);
      return `bucket reachable (${data?.length ?? 0} object sampled)`;
    }),
  );

  checks.push(
    await timed("ai_gateway", async () => {
      const key = Deno.env.get("LOVABLE_API_KEY");
      if (!key) throw new Error("LOVABLE_API_KEY missing");
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "user", content: "Reply with the single word: ok" }],
          max_tokens: 5,
        }),
      });
      if (!res.ok) throw new Error(`AI gateway ${res.status}`);
      return "gateway responding";
    }),
  );

  checks.push(
    await timed("tts", async () => {
      const base = Deno.env.get("CUSTOM_TTS_BASE_URL");
      if (!base) throw new Error("__skip__");
      const res = await fetch(`${base.replace(/\/+$/, "")}/v1/models`, {
        headers: Deno.env.get("CUSTOM_TTS_API_KEY")
          ? { Authorization: `Bearer ${Deno.env.get("CUSTOM_TTS_API_KEY")}` }
          : {},
      });
      if (!res.ok) throw new Error(`TTS ${res.status}`);
      return "endpoint responding";
    }),
  );

  checks.push(
    await timed("stripe", async () => {
      const key = Deno.env.get("STRIPE_SECRET_KEY");
      if (!key) throw new Error("__skip__");
      const res = await fetch("https://api.stripe.com/v1/products?limit=1", {
        headers: { Authorization: `Bearer ${key}` },
      });
      if (!res.ok) throw new Error(`Stripe ${res.status}`);
      return "api responding";
    }),
  );

  checks.push(
    await timed("weekly_cron", async () => {
      const { data, error } = await sb
        .from("weekly_serials")
        .select("week_year, release_date, status")
        .order("release_date", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!data) return "no episodes yet";
      const ageDays = (Date.now() - new Date(data.release_date as string).getTime()) / 86_400_000;
      if (ageDays > 9) throw new Error(`last episode is ${Math.round(ageDays)} days old`);
      return `last episode ${Math.round(ageDays)}d ago (${data.week_year ?? "n/a"})`;
    }),
  );

  const degraded = checks.filter((c) => c.status === "degraded");
  const status = degraded.length ? "degraded" : "ok";

  if (degraded.length) {
    const message = degraded.map((c) => `${c.name}: ${c.detail}`).join("; ");
    await sb.from("automation_logs").insert({
      run_id: crypto.randomUUID(),
      step: "health.check",
      level: "error",
      message,
      context: { checks },
    });
    await notifyAlert(message);
  }

  return json({ status, checked_at: new Date().toISOString(), details: checks });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
