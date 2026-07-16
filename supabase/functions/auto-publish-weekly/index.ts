// Autonomous weekly NakedKnights episode publisher.
// Triggered by pg_cron (with x-cron-secret) or by admin (with x-admin-token).
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-admin-token, x-cron-secret",
};

const SYSTEM_PROMPT =
  "You are the storyteller for the HeroDossier: NakedKnights Peace Project. " +
  "LORE: NakedKnights are brave knights who chose to REMOVE their heavy armor as a symbol of vulnerability, kindness, and commitment to peace. They wear simple tunics — NEVER unclothed. The theme is courage through kindness. " +
  "TONE: PG, all-ages (8-99), funny, adventurous, warm, cinematic. Zero sexual content, zero nudity, zero profanity, zero graphic violence. Solve conflict with empathy, humor, and creativity — never violence. " +
  "STRUCTURE: 600-800 word episode, present tense, ready for text-to-speech (no stage directions, no markdown). End on a fun cliffhanger. Weave in continuity from prior episodes and the lore bible when provided.";

const QUALITY_PROMPT =
  "You are a strict PG content reviewer for a kids-and-family audio serial. Score the following episode from 0-5 on: pg_safety (must be 5 — no sexual content, no nudity, no profanity, no graphic violence), peace_theme (solves conflict with empathy/creativity, not violence), fun_factor, continuity. Return JSON only: {pg_safety:number, peace_theme:number, fun_factor:number, continuity:number, notes:string}.";

interface RunCtx {
  runId: string;
  sb: ReturnType<typeof createClient>;
}

async function log(ctx: RunCtx, step: string, level: "info" | "warn" | "error", message: string, context?: unknown) {
  try {
    await ctx.sb.from("automation_logs").insert({
      run_id: ctx.runId,
      step,
      level,
      message,
      context: context ? (context as Record<string, unknown>) : null,
    });
  } catch (e) {
    console.error("log failed", e);
  }
  console.log(`[${ctx.runId}] ${level} ${step}: ${message}`);
}

function isoWeekYear(d = new Date()): string {
  // ISO week in America/New_York
  const nyStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
  const [y, m, day] = nyStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, day));
  const dayNum = dt.getUTCDay() || 7;
  dt.setUTCDate(dt.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(dt.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((dt.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${dt.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

async function callGemini(lovableKey: string, messages: unknown[], jsonMode = true) {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${lovableKey}` },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (!res.ok) throw new Error(`AI ${res.status}: ${await res.text().catch(() => "")}`);
  const j = await res.json();
  return j.choices?.[0]?.message?.content ?? "";
}

async function generateEpisodeStory(ctx: RunCtx, lovableKey: string, priorEpisodes: any[], lore: any[]) {
  const priorSummary = priorEpisodes
    .map((e) => `Ep ${e.episode_number} "${e.title}": ${e.description ?? ""}`)
    .join("\n") || "(none yet — this is the first episode)";
  const loreSummary = lore.map((l) => `- [${l.kind}] ${l.name}: ${l.summary}`).join("\n") || "(empty)";

  const user =
    `LORE BIBLE:\n${loreSummary}\n\nPRIOR EPISODES:\n${priorSummary}\n\n` +
    `Write the next episode. Return JSON with keys: ` +
    `title (max 60 chars), summary (1-2 sentence hook, max 200 chars), transcript (600-800 words, TTS-ready, no markdown, no stage directions), ` +
    `fun_facts (array of exactly 3 short strings), moral_lesson (one sentence), ` +
    `cover_prompt (single-sentence text-to-image prompt in warm storybook style, no nudity — knights in simple tunics), ` +
    `show_notes (100-180 words plain text), ` +
    `poll: {question: string (max 120 chars), options: array of exactly 4 short strings}, ` +
    `new_lore: array of {kind: 'character'|'place'|'artifact'|'theme', name, summary} for any new named entities introduced.`;

  const raw = await callGemini(lovableKey, [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: user },
  ]);
  const parsed = JSON.parse(raw);
  if (!parsed.title || !parsed.transcript) throw new Error("AI response missing required fields");
  return parsed;
}

async function qualityGate(lovableKey: string, story: any) {
  const raw = await callGemini(lovableKey, [
    { role: "system", content: QUALITY_PROMPT },
    { role: "user", content: `Title: ${story.title}\n\nTranscript:\n${story.transcript}` },
  ]);
  const scores = JSON.parse(raw);
  const ok =
    Number(scores.pg_safety) >= 5 &&
    Number(scores.peace_theme) >= 4 &&
    Number(scores.fun_factor) >= 4 &&
    Number(scores.continuity) >= 4;
  return { ok, scores };
}

async function synthAudio(ctx: RunCtx, transcript: string, episodeNumber: number): Promise<string | null> {
  const base = Deno.env.get("CUSTOM_TTS_BASE_URL");
  if (!base) {
    await log(ctx, "tts.skip", "warn", "CUSTOM_TTS_BASE_URL not set; publishing text-only");
    return null;
  }
  const model = Deno.env.get("CUSTOM_TTS_MODEL") || "kokoro";
  const voice = Deno.env.get("CUSTOM_TTS_VOICE") || "af_bella";
  const key = Deno.env.get("CUSTOM_TTS_API_KEY");
  const url = `${base.replace(/\/+$/, "")}/v1/audio/speech`;

  let lastErr: unknown = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (key) headers.Authorization = `Bearer ${key}`;
      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({ model, input: transcript, voice, response_format: "mp3" }),
      });
      if (!res.ok) throw new Error(`TTS ${res.status}`);
      const bytes = new Uint8Array(await res.arrayBuffer());
      const path = `episodes/episode_${episodeNumber}_${crypto.randomUUID()}.mp3`;
      const { error: upErr } = await ctx.sb.storage
        .from("chronicles")
        .upload(path, bytes, { contentType: "audio/mpeg", upsert: false });
      if (upErr) throw upErr;
      await log(ctx, "tts.upload", "info", `audio stored at ${path}`, { attempt });
      return path;
    } catch (e) {
      lastErr = e;
      await log(ctx, "tts.attempt", "warn", `attempt ${attempt} failed: ${(e as Error).message}`);
      if (attempt < 3) await new Promise((r) => setTimeout(r, Math.pow(3, attempt - 1) * 1000));
    }
  }
  await log(ctx, "tts.fail", "error", "TTS failed after 3 attempts, publishing text-only", { error: String(lastErr) });
  await notifyAlert(`TTS failed for weekly run ${ctx.runId}: ${String(lastErr)}`);
  return null;
}

async function notifyAlert(message: string) {
  const hook = Deno.env.get("AUTOMATION_ALERT_WEBHOOK");
  if (!hook) return;
  try {
    await fetch(hook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: `[NakedKnights] ${message}` }),
    });
  } catch (e) {
    console.error("alert webhook failed", e);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Auth: either x-cron-secret (from pg_cron) or x-admin-token (manual admin trigger)
  const cronSecret = Deno.env.get("CRON_SECRET");
  const adminToken = Deno.env.get("ADMIN_TOKEN");
  const providedCron = req.headers.get("x-cron-secret");
  const providedAdmin = req.headers.get("x-admin-token");
  const cronOk = !!cronSecret && providedCron === cronSecret;
  const adminOk = !!adminToken && providedAdmin === adminToken;
  if (!cronOk && !adminOk) return json({ error: "Unauthorized" }, 401);

  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  if (!lovableKey) return json({ error: "LOVABLE_API_KEY missing" }, 500);

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const runId = crypto.randomUUID();
  const ctx: RunCtx = { runId, sb };
  const weekYear = isoWeekYear();

  await log(ctx, "run.start", "info", `weekly run started for ${weekYear}`, { triggered_by: cronOk ? "cron" : "admin" });

  // Idempotency: already have a row for this week?
  const { data: existing } = await sb
    .from("weekly_serials")
    .select("id, episode_number")
    .eq("week_year", weekYear)
    .maybeSingle();
  if (existing) {
    await log(ctx, "run.skip", "info", `episode already exists for ${weekYear}`, existing);
    return json({ ok: true, skipped: true, week_year: weekYear, run_id: runId });
  }

  try {
    // Context
    const { data: priorEpisodes } = await sb
      .from("weekly_serials")
      .select("episode_number, title, description")
      .eq("status", "published")
      .order("episode_number", { ascending: false })
      .limit(5);
    const { data: lore } = await sb.from("lore_bible").select("kind, name, summary").limit(200);
    await log(ctx, "context.load", "info", `loaded ${priorEpisodes?.length ?? 0} prior episodes, ${lore?.length ?? 0} lore entries`);

    // Generate + quality gate (with 1 regeneration)
    let story: any | null = null;
    let scores: any = null;
    for (let attempt = 1; attempt <= 2; attempt++) {
      const s = await generateEpisodeStory(ctx, lovableKey, priorEpisodes ?? [], lore ?? []);
      const q = await qualityGate(lovableKey, s);
      await log(ctx, "quality.check", q.ok ? "info" : "warn", `attempt ${attempt}: ${q.ok ? "pass" : "fail"}`, q.scores);
      if (q.ok) { story = s; scores = q.scores; break; }
      if (attempt === 2) {
        await notifyAlert(`Quality gate failed twice for ${weekYear}. Marking run as failed.`);
        await sb.from("weekly_serials").insert({
          title: s.title?.slice(0, 200) ?? `Failed run ${weekYear}`,
          episode_number: 0,
          description: s.summary ?? null,
          transcript_text: s.transcript ?? null,
          week_year: weekYear,
          status: "failed",
          is_published: false,
          run_id: runId,
        });
        return json({ ok: false, error: "Quality gate failed twice", run_id: runId }, 200);
      }
    }

    // Next episode number
    const { data: maxRow } = await sb
      .from("weekly_serials")
      .select("episode_number")
      .order("episode_number", { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextNum = (maxRow?.episode_number ?? 0) + 1;

    // Audio
    const audioPath = await synthAudio(ctx, story.transcript, nextNum);

    // Flip previous is_current
    await sb.from("weekly_serials").update({ is_current: false }).eq("is_current", true);

    // Insert
    const { data: newRow, error: insErr } = await sb
      .from("weekly_serials")
      .insert({
        title: String(story.title).slice(0, 200),
        episode_number: nextNum,
        description: story.summary?.slice(0, 2000) ?? null,
        transcript_text: story.transcript,
        audio_url: audioPath,
        is_published: true,
        is_premium: false,
        status: "published",
        is_current: true,
        week_year: weekYear,
        fun_facts: story.fun_facts ?? null,
        moral_lesson: story.moral_lesson ?? null,
        cover_prompt: story.cover_prompt ?? null,
        show_notes: story.show_notes ?? null,
        run_id: runId,
      })
      .select()
      .single();
    if (insErr) throw insErr;
    await log(ctx, "insert.episode", "info", `episode ${nextNum} inserted`, { id: newRow.id });

    // Lore upsert
    if (Array.isArray(story.new_lore) && story.new_lore.length) {
      for (const l of story.new_lore) {
        if (!l?.kind || !l?.name || !l?.summary) continue;
        await sb.from("lore_bible").upsert(
          {
            kind: l.kind,
            name: String(l.name).slice(0, 120),
            summary: String(l.summary).slice(0, 2000),
            first_seen_episode: nextNum,
          },
          { onConflict: "kind,name" },
        );
      }
      await log(ctx, "lore.upsert", "info", `${story.new_lore.length} lore entries considered`);
    }

    // Poll
    if (story.poll?.question && Array.isArray(story.poll?.options)) {
      await sb.from("episode_polls").insert({
        episode_id: newRow.id,
        question: String(story.poll.question).slice(0, 300),
        options: story.poll.options.slice(0, 6),
      });
      await log(ctx, "poll.insert", "info", "poll created");
    }

    // Auto-archive episodes older than 12 weeks
    const cutoff = new Date(Date.now() - 12 * 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: archived } = await sb
      .from("weekly_serials")
      .update({ status: "archived", is_current: false })
      .lt("release_date", cutoff)
      .eq("status", "published")
      .neq("id", newRow.id)
      .select("id");
    await log(ctx, "archive.old", "info", `archived ${archived?.length ?? 0} old episodes`);

    await log(ctx, "run.done", "info", `weekly run complete for ${weekYear}`, { episode_number: nextNum });
    return json({ ok: true, run_id: runId, episode_number: nextNum, episode_id: newRow.id, has_audio: !!audioPath, quality: scores });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await log(ctx, "run.error", "error", msg);
    await notifyAlert(`Weekly run ${weekYear} failed: ${msg}`);
    return json({ ok: false, error: msg, run_id: runId }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
