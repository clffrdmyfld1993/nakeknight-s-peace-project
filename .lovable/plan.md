# NakedKnights Autonomous Chronicles Engine

Reframe: NakedKnights = knights who remove heavy armor as a symbol of vulnerability, kindness, peace. PG, all-ages, funny, adventurous. This tone is baked into every system prompt.

## 1. Database (one migration)

New tables:
- `lore_bible` — `id`, `kind` (character|place|artifact|theme), `name`, `summary`, `first_seen_episode`, timestamps. RLS: authenticated read, service_role write.
- `automation_logs` — `id`, `run_id`, `step`, `level` (info|warn|error), `message`, `context jsonb`, `created_at`. RLS: service_role only.
- `episode_polls` — `id`, `episode_id` fk, `question`, `options jsonb`, `created_at`. RLS: public read on published episodes.

Extend `weekly_serials`:
- `week_year text` (e.g. `2026-W29`) UNIQUE — idempotency key
- `status text` default `'draft'` (draft|published|archived|failed)
- `is_current boolean` default false
- `fun_facts jsonb`, `moral_lesson text`, `cover_prompt text`, `show_notes text`
- `run_id uuid` — link to automation_logs

All GRANTs + RLS included per platform rules.

## 2. Edge Functions

### `auto-publish-weekly` (new, no JWT, HMAC/service-role gated)
- Compute `week_year` from `now()` in America/New_York.
- `pg_advisory_lock` on hash of week_year; abort if held or if row already exists → log `skipped_idempotent`.
- Load last 5 published episodes + full `lore_bible` → build continuity context.
- Call Lovable AI (`google/gemini-3-flash-preview`) with the PG NakedKnights system prompt → JSON `{title, summary, transcript, fun_facts[3], moral_lesson, cover_prompt, show_notes, poll:{question,options[]}, new_lore[]}`.
- **Quality gate**: second Gemini call scores PG-safety, peace-theme, fun, continuity (0–5 each). If any <4 or PG-safety <5 → regenerate once. Fail after second attempt → status `failed`, alert webhook (`AUTOMATION_ALERT_WEBHOOK` if set).
- TTS: POST to `${CUSTOM_TTS_BASE_URL}/v1/audio/speech` (Kokoro-compatible). Retry 3× with exponential backoff (1s/3s/9s). On persistent failure → keep text episode, mark `audio_url` null, log warning, still publish.
- Upload MP3 to private `chronicles` bucket at `episodes/episode_${n}_${uuid}.mp3` (unpredictable).
- Insert into `weekly_serials`: `episode_number = COALESCE(MAX,0)+1`, `week_year`, `status='published'`, `is_current=true`. Flip previous `is_current=false`. Archive rows older than 12 weeks → `status='archived'`, `is_current=false`.
- Upsert `new_lore[]` into `lore_bible`. Insert poll into `episode_polls`.
- Every step writes to `automation_logs` under a shared `run_id`.

### `get-episode-stream` (new, verify_jwt=true)
- Authenticated only. In-memory rate limit (10/min/user).
- Body: `{ episode_id }`. Look up `audio_url` (storage path). Return 60-minute `createSignedUrl`. Never expose raw path to unauth users.
- Premium episodes additionally check purchase via existing fulfillment table before signing.

### `generate-episode` (refactor)
Extract shared helpers `lib/episode-core.ts` (Deno import) — used by both `generate-episode` and `auto-publish-weekly` so logic isn't duplicated.

`supabase/config.toml`: add `[functions.auto-publish-weekly] verify_jwt=false`, `[functions.get-episode-stream] verify_jwt=true`.

## 3. Storage hardening

`chronicles` bucket stays private (already is). Confirm RLS on `storage.objects`:
- Deny anon/authenticated direct SELECT on `chronicles` (already in place from prior migration).
- Only service-role edge functions can read; frontend calls `get-episode-stream` for a signed URL.
- Frontend `Chronicles.tsx` updated to fetch signed URL on play instead of using `audio_url` directly for premium/current episodes.

## 4. Scheduler

New SQL run via the Supabase insert path (contains project-specific URL, not a portable migration):

```sql
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

select cron.schedule(
  'auto-publish-weekly-friday-midnight-est',
  '0 4 * * 5',  -- Fri 04:00 UTC = Fri 00:00 EST
  $$
  select net.http_post(
    url := 'https://mxawkvbwtxikircvecih.supabase.co/functions/v1/auto-publish-weekly',
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'CRON_SECRET')
    ),
    body := jsonb_build_object('triggered_by','pg_cron','week', now())
  );
  $$
);
```

`auto-publish-weekly` validates `x-cron-secret` against `CRON_SECRET`. New secrets requested: `CRON_SECRET` (generate), `AUTOMATION_ALERT_WEBHOOK` (optional, user-supplied). Kokoro TTS reuses existing `CUSTOM_TTS_BASE_URL` / `CUSTOM_TTS_API_KEY`.

## 5. Admin surface

`/admin-upload` additions:
- "Run weekly job now" button → calls `auto-publish-weekly` with admin token (bypasses cron secret path).
- Automation log viewer (last 50 runs, grouped by `run_id`).
- Lore Bible CRUD table.

## Acceptance

After deploy I'll return:
- New edge function code paths
- Storage RLS confirmation
- `lore_bible` + `automation_logs` schemas
- `select * from cron.job` output confirming the schedule is active

## Technical notes (for you)
- No sexual/adult framing anywhere — system prompt + quality gate both enforce PG.
- Idempotency by `week_year` UNIQUE + advisory lock → safe against double cron fires.
- Audio failures degrade gracefully (text still ships) rather than blocking the week.
- Signed URLs (60 min) + private bucket + unpredictable filenames = the anti-piracy layer requested.
