import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { z } from "npm:zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-admin-token",
};

const SerialSchema = z.object({
  title: z.string().min(1).max(200),
  episode_number: z.number().int().min(0).max(10_000),
  description: z.string().max(2000).optional().nullable(),
  transcript_text: z.string().max(200_000).optional().nullable(),
  audio_url: z.string().max(1000).optional().nullable(),
  cover_url: z.string().max(1000).optional().nullable(),
  duration_seconds: z.number().int().min(0).max(86_400).optional().nullable(),
  release_date: z.string().optional(),
  is_published: z.boolean().optional(),
  is_premium: z.boolean().optional(),
});

const LoreSchema = z.object({
  kind: z.enum(["character", "place", "artifact", "theme"]),
  name: z.string().min(1).max(200),
  summary: z.string().min(1).max(4000),
  first_seen_episode: z.number().int().min(0).max(10_000).optional().nullable(),
});

const BodySchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("list") }),
  z.object({ action: z.literal("create"), data: SerialSchema }),
  z.object({ action: z.literal("update"), id: z.string().uuid(), data: SerialSchema.partial() }),
  z.object({ action: z.literal("delete"), id: z.string().uuid() }),
  z.object({
    action: z.literal("signed_upload"),
    path: z.string().min(1).max(500).regex(/^[A-Za-z0-9._\-\/]+$/),
  }),
  z.object({ action: z.literal("lore_list") }),
  z.object({ action: z.literal("lore_create"), data: LoreSchema }),
  z.object({ action: z.literal("lore_update"), id: z.string().uuid(), data: LoreSchema.partial() }),
  z.object({ action: z.literal("lore_delete"), id: z.string().uuid() }),
  z.object({
    action: z.literal("logs_list"),
    limit: z.number().int().min(1).max(500).optional(),
    level: z.enum(["info", "warn", "error"]).optional(),
    run_id: z.string().uuid().optional(),
  }),
  z.object({ action: z.literal("analytics") }),
]);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const adminToken = Deno.env.get("ADMIN_TOKEN");
  if (!adminToken) {
    return json({ error: "ADMIN_TOKEN not configured on server" }, 500);
  }
  const provided = req.headers.get("x-admin-token");
  if (!provided || provided !== adminToken) {
    return json({ error: "Unauthorized" }, 401);
  }

  const parsed = BodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return json({ error: "Invalid request", details: parsed.error.flatten() }, 400);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const body = parsed.data;
    if (body.action === "list") {
      const { data, error } = await supabase
        .from("weekly_serials")
        .select("*")
        .order("episode_number", { ascending: true });
      if (error) throw error;
      return json({ rows: data });
    }
    if (body.action === "create") {
      const { data, error } = await supabase
        .from("weekly_serials")
        .insert(body.data)
        .select()
        .single();
      if (error) throw error;
      return json({ row: data });
    }
    if (body.action === "update") {
      const { data, error } = await supabase
        .from("weekly_serials")
        .update(body.data)
        .eq("id", body.id)
        .select()
        .single();
      if (error) throw error;
      return json({ row: data });
    }
    if (body.action === "delete") {
      const { error } = await supabase.from("weekly_serials").delete().eq("id", body.id);
      if (error) throw error;
      return json({ ok: true });
    }
    if (body.action === "signed_upload") {
      const { data, error } = await supabase.storage
        .from("chronicles")
        .createSignedUploadUrl(body.path);
      if (error) throw error;
      return json({ path: data.path, token: data.token, signedUrl: data.signedUrl });
    }
    if (body.action === "lore_list") {
      const { data, error } = await supabase
        .from("lore_bible")
        .select("*")
        .order("kind", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      return json({ rows: data });
    }
    if (body.action === "lore_create") {
      const { data, error } = await supabase.from("lore_bible").insert(body.data).select().single();
      if (error) throw error;
      return json({ row: data });
    }
    if (body.action === "lore_update") {
      const { data, error } = await supabase
        .from("lore_bible")
        .update(body.data)
        .eq("id", body.id)
        .select()
        .single();
      if (error) throw error;
      return json({ row: data });
    }
    if (body.action === "lore_delete") {
      const { error } = await supabase.from("lore_bible").delete().eq("id", body.id);
      if (error) throw error;
      return json({ ok: true });
    }
    if (body.action === "logs_list") {
      let q = supabase
        .from("automation_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(body.limit ?? 200);
      if (body.level) q = q.eq("level", body.level);
      if (body.run_id) q = q.eq("run_id", body.run_id);
      const { data, error } = await q;
      if (error) throw error;
      return json({ rows: data });
    }
    if (body.action === "analytics") {
      const [eps, plays, shares, leads, inquiries] = await Promise.all([
        supabase
          .from("weekly_serials")
          .select("id, title, episode_number, is_published, is_premium")
          .order("episode_number", { ascending: true }),
        supabase.from("episode_plays").select("episode_id, played_at, ref").limit(5000),
        supabase.from("referral_shares").select("network, referral_code").limit(5000),
        supabase.from("leads").select("source, created_at").limit(5000),
        supabase.from("license_inquiries").select("id").limit(1000),
      ]);
      if (eps.error) throw eps.error;

      const playRows = plays.data ?? [];
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const perEpisode = new Map<string, number>();
      const refBreakdown = new Map<string, number>();
      let playsThisWeek = 0;
      for (const p of playRows) {
        perEpisode.set(p.episode_id, (perEpisode.get(p.episode_id) ?? 0) + 1);
        const key = p.ref || "(direct)";
        refBreakdown.set(key, (refBreakdown.get(key) ?? 0) + 1);
        if (new Date(p.played_at).getTime() >= weekAgo) playsThisWeek++;
      }
      const networks = new Map<string, number>();
      for (const s of shares.data ?? []) {
        networks.set(s.network, (networks.get(s.network) ?? 0) + 1);
      }
      const leadSources = new Map<string, number>();
      for (const l of leads.data ?? []) {
        leadSources.set(l.source, (leadSources.get(l.source) ?? 0) + 1);
      }

      return json({
        episodes: (eps.data ?? []).map((e) => ({ ...e, plays: perEpisode.get(e.id) ?? 0 })),
        totals: {
          plays: playRows.length,
          plays_this_week: playsThisWeek,
          shares: (shares.data ?? []).length,
          leads: (leads.data ?? []).length,
          license_inquiries: (inquiries.data ?? []).length,
          episodes_published: (eps.data ?? []).filter((e) => e.is_published).length,
        },
        ref_breakdown: [...refBreakdown.entries()]
          .map(([ref, count]) => ({ ref, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 20),
        share_networks: [...networks.entries()].map(([network, count]) => ({ network, count })),
        lead_sources: [...leadSources.entries()].map(([source, count]) => ({ source, count })),
      });
    }
    return json({ error: "Unknown action" }, 400);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : String(err) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
