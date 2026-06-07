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
  prompt: z.string().min(4).max(2000),
  episode_number: z.number().int().min(0).max(10_000),
  voice: z.string().max(64).optional(),
  publish: z.boolean().optional(),
  premium: z.boolean().optional(),
  generate_audio: z.boolean().optional(),
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
  const { prompt, episode_number, publish = true, premium = false, generate_audio = true } = parsed.data;

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // 1) TEXT — Lovable AI Gateway (Gemini), free-tier
  const sys =
    "You are the head writer for NAKEKNIGHT CHRONICLES — a noir, mythic, hard-boiled audio serial. " +
    "Voice: terse, cinematic, present-tense. No purple prose. Return STRICT JSON only.";
  const userMsg =
    `Write one episode based on this brief:\n"${prompt}"\n\n` +
    `Episode number: ${episode_number}.\n` +
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

  if (aiRes.status === 429) return json({ error: "AI rate limit, try again shortly" }, 429);
  if (aiRes.status === 402) return json({ error: "AI credits exhausted. Add credits in Lovable workspace." }, 402);
  if (!aiRes.ok) return json({ error: `AI failed: ${aiRes.status} ${await aiRes.text()}` }, 500);

  const aiJson = await aiRes.json();
  let story: { title: string; description: string; transcript: string };
  try {
    story = JSON.parse(aiJson.choices?.[0]?.message?.content ?? "{}");
    if (!story.title || !story.transcript) throw new Error("missing fields");
  } catch (e) {
    return json({ error: "AI returned malformed JSON", raw: aiJson }, 500);
  }

  // 2) AUDIO — optional, OpenAI-compatible TTS (Kokoro etc.)
  let audioPath: string | null = null;
  const ttsBase = Deno.env.get("CUSTOM_TTS_BASE_URL");
  if (generate_audio && ttsBase) {
    try {
      const ttsModel = Deno.env.get("CUSTOM_TTS_MODEL") || "kokoro";
      const ttsVoice = parsed.data.voice || Deno.env.get("CUSTOM_TTS_VOICE") || "af_bella";
      const ttsKey = Deno.env.get("CUSTOM_TTS_API_KEY");
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
      if (!ttsRes.ok) throw new Error(`TTS ${ttsRes.status}: ${await ttsRes.text()}`);
      const audioBuf = new Uint8Array(await ttsRes.arrayBuffer());

      const safe = story.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
      const path = `ep-${String(episode_number).padStart(2, "0")}-${safe}-${Date.now()}.mp3`;
      const { error: upErr } = await sb.storage
        .from("chronicles")
        .upload(path, audioBuf, { contentType: "audio/mpeg", upsert: false });
      if (upErr) throw upErr;
      audioPath = path;
    } catch (e) {
      // Don't abort the whole pipeline — save the text, surface the TTS error
      console.error("TTS failed:", e);
      return json(
        {
          error: `TTS failed: ${e instanceof Error ? e.message : String(e)}`,
          story,
          hint: "Story not saved. Fix CUSTOM_TTS_BASE_URL or rerun with generate_audio=false.",
        },
        502,
      );
    }
  }

  // 3) INSERT row
  const { data: row, error: insErr } = await sb
    .from("weekly_serials")
    .insert({
      title: story.title.slice(0, 200),
      episode_number,
      description: story.description?.slice(0, 2000) ?? null,
      transcript_text: story.transcript,
      audio_url: audioPath,
      is_published: publish,
      is_premium: premium,
      release_date: new Date().toISOString(),
    })
    .select()
    .single();

  if (insErr) return json({ error: insErr.message, story, audioPath }, 500);
  return json({ ok: true, row, audioPath, hadAudio: !!audioPath });
});

function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
