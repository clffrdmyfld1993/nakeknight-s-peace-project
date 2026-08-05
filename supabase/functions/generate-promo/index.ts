// Generates social promo copy for a published episode and stores it in episode_promos.
// Callable by admin (x-admin-token) or internally by auto-publish-weekly (x-cron-secret).
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-admin-token, x-cron-secret",
};

const SITE = "https://herodossier.lovable.app";

const PROMO_SYSTEM =
  "You are the social growth writer for NakeKnight Chronicles — a PG, all-ages, funny and adventurous audio serial about knights who removed their armor as a symbol of kindness and peace. " +
  "Voice: warm, cinematic, a little wry. No sexual content, no nudity, no profanity, no graphic violence. Never imply the knights are unclothed — they wear simple tunics. " +
  "Write native-feeling copy for each platform, not the same text reworded. Include the episode link exactly where given.";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const adminToken = Deno.env.get("ADMIN_TOKEN");
  const cronSecret = Deno.env.get("CRON_SECRET");
  const ok =
    (!!adminToken && req.headers.get("x-admin-token") === adminToken) ||
    (!!cronSecret && req.headers.get("x-cron-secret") === cronSecret);
  if (!ok) return json({ error: "Unauthorized" }, 401);

  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  if (!lovableKey) return json({ error: "LOVABLE_API_KEY missing" }, 500);

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const runId = crypto.randomUUID();

  try {
    const body = await req.json().catch(() => ({}));
    let episodeId: string | undefined = body.episode_id;

    let query = sb
      .from("weekly_serials")
      .select("id, title, episode_number, description, transcript_text, moral_lesson");
    const { data: episode, error: epErr } = episodeId
      ? await query.eq("id", episodeId).maybeSingle()
      : await query.eq("is_published", true).order("episode_number", { ascending: false }).limit(1).maybeSingle();
    if (epErr) throw epErr;
    if (!episode) return json({ error: "Episode not found" }, 404);
    episodeId = episode.id as string;

    const link = `${SITE}/chronicles?ep=${episode.episode_number}`;
    const user =
      `Episode ${episode.episode_number}: "${episode.title}"\n` +
      `Hook: ${episode.description ?? ""}\n` +
      `Moral: ${episode.moral_lesson ?? ""}\n` +
      `Excerpt: ${String(episode.transcript_text ?? "").slice(0, 1500)}\n\n` +
      `Link: ${link}\n\n` +
      `Return JSON with keys: x_thread (a 4-6 post thread, posts separated by "\\n\\n---\\n\\n", each under 260 chars, last post has the link and a call to listen), ` +
      `reddit_post (title line then body, 120-220 words, conversational, no hype, ends with the link), ` +
      `ig_caption (60-120 words plus 8-12 relevant hashtags on their own line), ` +
      `video_script (a 30-45 second vertical-video script with [VISUAL] and [VO] beats).`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${lovableKey}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: PROMO_SYSTEM },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!res.ok) throw new Error(`AI ${res.status}: ${await res.text().catch(() => "")}`);
    const j = await res.json();
    const promo = JSON.parse(j.choices?.[0]?.message?.content ?? "{}");

    const row = {
      episode_id: episodeId,
      x_thread: promo.x_thread ?? null,
      reddit_post: promo.reddit_post ?? null,
      ig_caption: promo.ig_caption ?? null,
      video_script: promo.video_script ?? null,
      run_id: runId,
    };

    const { error: upErr } = await sb
      .from("episode_promos")
      .upsert(row, { onConflict: "episode_id" });
    if (upErr) throw upErr;

    await sb.from("automation_logs").insert({
      run_id: runId,
      step: "promo.generate",
      level: "info",
      message: `promo copy generated for episode ${episode.episode_number}`,
      context: { episode_id: episodeId },
    });

    return json({ ok: true, episode_id: episodeId, promo: row, run_id: runId });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await sb.from("automation_logs").insert({
      run_id: runId,
      step: "promo.error",
      level: "error",
      message: msg,
    });
    return json({ ok: false, error: msg, run_id: runId }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
