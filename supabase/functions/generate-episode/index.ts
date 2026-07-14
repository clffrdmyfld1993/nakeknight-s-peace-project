// Generate a Chronicles episode end-to-end using Lovable AI (text) +
// any OpenAI-compatible TTS endpoint (e.g. Kokoro-FastAPI / HF Space).
//
// Env required:
//   ADMIN_TOKEN                  – gating
//   LOVABLE_API_KEY              – auto-provisioned
//   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY
// Env optional (TTS):
//   CUSTOM_TTS_BASE_URL          – e.g. https://your-space.hf.space  OR  http://host:8880
//                                  Function will POST to `${BASE}/v1/audio/speech`.
//   CUSTOM_TTS_API_KEY           – sent as Bearer if present
//   CUSTOM_TTS_MODEL             – default "kokoro"
//   CUSTOM_TTS_VOICE             – default "af_bella"

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { z } from "npm:zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-admin-token",
};

const BodySchema = z.object({
  prompt: z.string().min(4).max(2000).optional(),
  episode_number: z.number().int().min(0).max(10_000).optional(),
  voice: z.string().max(64).optional(),
  publish: z.boolean().optional(),
  premium: z.boolean().optional(),
  generate_audio: z.boolean().optional(),
  count: z.number().int().min(1).max(8).optional(),
  weekly_offset: z.boolean().optional(),
  mode: z.enum(["episode", "promo"]).optional(),
  episode_id: z.string().uuid().optional(),
});

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const adminToken = Deno.env.get("ADMIN_TOKEN");
  if (!adminToken) return json({ error: "ADMIN_TOKEN not set" }, 500);
  if (req.headers.get("x-admin-token") !== adminToken) return json({ error: "Unauthorized" }, 401);

  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  if (!lovableKey) return json({ error: "LOVABLE_API_KEY missing" }, 500);

  const parsed = BodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return json({ error: "Invalid body", details: parsed.error.flatten() }, 400);
  const {
    prompt,
    episode_number,
    publish = true,
    premium = false,
    generate_audio = true,
    count = 1,
    weekly_offset = false,
    mode = "episode",
    episode_id,
  } = parsed.data;

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Promo assets mode: generate share copy from an existing episode
  if (mode === "promo") {
    if (!episode_id) return json({ error: "episode_id required for promo mode" }, 400);
    const { data: ep, error: epErr } = await sb
      .from("weekly_serials")
      .select("title, episode_number, description, transcript_text")
      .eq("id", episode_id)
      .maybeSingle();
    if (epErr || !ep) return json({ error: "Episode not found" }, 404);

    const promoSys =
      "You write viral social copy for NAKEKNIGHT CHRONICLES, a noir AI-built audio drama. " +
      "Voice: terse, cinematic, mysterious, purple-neon aesthetic. Return STRICT JSON only.";
    const promoUser =
      `Episode ${ep.episode_number}: "${ep.title}"\nHook: ${ep.description ?? ""}\n\nExcerpt:\n` +
      `${(ep.transcript_text ?? "").slice(0, 1200)}\n\n` +
      `Return JSON: {"x_thread": string[] (6-8 short tweets under 260 chars, no numbering), ` +
      `"reddit_post": {"title": string, "body": string (200-350 words, for r/audiodrama)}, ` +
      `"ig_caption": string (under 300 chars, 3-5 hashtags), ` +
      `"video_script": string (30-second vertical video script, VO + on-screen text cues)}. ` +
      `Every URL in the copy must be exactly "https://herodossier.lovable.app/chronicles?ref=REF_CODE" so the caller can substitute.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${lovableKey}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: promoSys },
          { role: "user", content: promoUser },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (aiRes.status === 429) return json({ error: "AI rate limit" }, 429);
    if (aiRes.status === 402) return json({ error: "AI credits exhausted" }, 402);
    if (!aiRes.ok) return json({ error: `AI ${aiRes.status}` }, 500);
    const aiJson = await aiRes.json();
    try {
      const promo = JSON.parse(aiJson.choices?.[0]?.message?.content ?? "{}");
      return json({ ok: true, promo, episode: { id: episode_id, title: ep.title, episode_number: ep.episode_number } });
    } catch {
      return json({ error: "AI returned malformed JSON" }, 500);
    }
  }

  if (!prompt || episode_number === undefined) {
    return json({ error: "prompt and episode_number required" }, 400);
  }

  const sys =
    "You are the head writer for NAKEKNIGHT CHRONICLES — a noir, mythic, hard-boiled audio serial. " +
    "Voice: terse, cinematic, present-tense. No purple prose. Return STRICT JSON only.";

  const ttsBase = Deno.env.get("CUSTOM_TTS_BASE_URL");
  const ttsModel = Deno.env.get("CUSTOM_TTS_MODEL") || "kokoro";
  const ttsVoice = parsed.data.voice || Deno.env.get("CUSTOM_TTS_VOICE") || "af_bella";
  const ttsKey = Deno.env.get("CUSTOM_TTS_API_KEY");

  const results: Array<{ row: unknown; audioPath: string | null; hadAudio: boolean; title: string; episode_number: number }> = [];
  const errors: Array<{ episode_number: number; error: string }> = [];

  for (let i = 0; i < count; i++) {
    const epNum = episode_number + i;
    const release = weekly_offset
      ? new Date(Date.now() + i * 7 * 24 * 60 * 60 * 1000).toISOString()
      : new Date().toISOString();

    const userMsg =
      `Write one episode based on this brief:\n"${prompt}"\n\n` +
      `Episode number: ${epNum} of a ${count}-episode arc (this is episode ${i + 1}).\n` +
      `Return JSON: {"title": string (max 60 chars), "description": string (1–2 sentences, hook), ` +
      `"transcript": string (650–900 words, first-person narration ready for TTS, no stage directions, no markdown)}`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${lovableKey}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: userMsg },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (aiRes.status === 429) { errors.push({ episode_number: epNum, error: "AI rate limit" }); continue; }
    if (aiRes.status === 402) return json({ error: "AI credits exhausted", results, errors }, 402);
    if (!aiRes.ok) { errors.push({ episode_number: epNum, error: `AI ${aiRes.status}` }); continue; }

    const aiJson = await aiRes.json();
    let story: { title: string; description: string; transcript: string };
    try {
      story = JSON.parse(aiJson.choices?.[0]?.message?.content ?? "{}");
      if (!story.title || !story.transcript) throw new Error("missing fields");
    } catch {
      errors.push({ episode_number: epNum, error: "AI returned malformed JSON" });
      continue;
    }

    let audioPath: string | null = null;
    if (generate_audio && ttsBase) {
      try {
        const ttsHeaders: Record<string, string> = { "Content-Type": "application/json" };
        if (ttsKey) ttsHeaders.Authorization = `Bearer ${ttsKey}`;
        const ttsUrl = `${ttsBase.replace(/\/+$/, "")}/v1/audio/speech`;
        const ttsRes = await fetch(ttsUrl, {
          method: "POST",
          headers: ttsHeaders,
          body: JSON.stringify({
            model: ttsModel,
            input: story.transcript,
            voice: ttsVoice,
            response_format: "mp3",
          }),
        });
        if (!ttsRes.ok) throw new Error(`TTS ${ttsRes.status}`);
        const audioBuf = new Uint8Array(await ttsRes.arrayBuffer());
        const safe = story.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
        const path = `ep-${String(epNum).padStart(2, "0")}-${safe}-${Date.now()}.mp3`;
        const { error: upErr } = await sb.storage
          .from("chronicles")
          .upload(path, audioBuf, { contentType: "audio/mpeg", upsert: false });
        if (upErr) throw upErr;
        audioPath = path;
      } catch (e) {
        // continue with text-only if TTS fails for one episode
        console.error("TTS failed for ep", epNum, e);
      }
    }

    const { data: row, error: insErr } = await sb
      .from("weekly_serials")
      .insert({
        title: story.title.slice(0, 200),
        episode_number: epNum,
        description: story.description?.slice(0, 2000) ?? null,
        transcript_text: story.transcript,
        audio_url: audioPath,
        is_published: publish,
        is_premium: premium,
        release_date: release,
      })
      .select()
      .single();

    if (insErr) {
      errors.push({ episode_number: epNum, error: insErr.message });
      continue;
    }
    results.push({
      row,
      audioPath,
      hadAudio: !!audioPath,
      title: story.title,
      episode_number: epNum,
    });
  }

  // Back-compat: when count=1, return single-row shape
  if (count === 1 && results[0]) {
    return json({ ok: true, ...results[0], results, errors });
  }
  return json({ ok: errors.length === 0, results, errors, generated: results.length });
});

function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
