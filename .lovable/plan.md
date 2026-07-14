
# NakeKnight Peace Project — Universe Hub Upgrade

Build on the existing app. Reuse `weekly_serials`, `leads`, `chronicles` + `digital-products` buckets, and the `admin-serials`, `create-payment`, `fulfill-purchase`, `generate-episode` edge functions. No new tables required for the core build; a small optional `episode_plays` table only if we add real play tracking (flagged below).

## Phase 1 — Homepage as Universe Hub (`/`)

Refit `PeacemakerHero` + a new `UniverseValueStack` section:
- Headline + tagline exactly as specced.
- Three CTAs: Listen Free → `/chronicles`, Unlock Lifetime $29, Buy Case Files $15 (both call `create-payment` with `referral` from `localStorage.nk_ref` and `source`).
- Countdown pulls next future `weekly_serials.release_date` (already wired — extend styling).
- New `JoinPeaceProject` email capture → inserts into `leads` (`source=homepage`, `referral_code` from localStorage). Reuses existing `LeadCapture` component pattern with new copy.
- Social-proof row: reads published episode count + a computed "listeners this week" (episode count × static multiplier placeholder until real analytics).
- New `FloatingShareButton` fixed bottom-right: copies `https://herodossier.lovable.app/?ref=<code>` and opens X/Reddit share.
- Global `RefCapture` mounted in `App.tsx`: on load, if `?ref=` present, store in `localStorage.nk_ref`.

## Phase 2 — `/chronicles` retention + SEO engine

- Redesign episode cards: cover art, `EP##` chip, title, duration, hook, Free/Locked badge.
- `AudioPlayer` (existing) used for free episodes; premium episodes call `fulfill-purchase` with saved `session_id` from `localStorage.nk_session_id` to fetch a signed URL, else render Lock + "$29 Lifetime" CTA.
- Expandable transcript per card (SEO).
- `ShareButtons` per episode (X, Reddit, WhatsApp, Copy) with prefilled title + hook + `?ref=`.
- Binge Mode toggle (auto-advances) + "Start from EP01" button.
- SEO: `PodcastSeries` JSON-LD on list, `PodcastEpisode` per card. Extend `sitemap.xml` with `/share`, `/referrals`, `/universe`. Add dark neon OG fallback image (generated once at `src/assets/og-chronicles.jpg`).

## Phase 3 — `/store` + `/success` upsells

- Store grid: $15 Case Files, $29 Lifetime, $39 Bundle (Best Value). Bundle uses both existing Stripe prices in one Checkout `line_items` call — no new price IDs.
- Waitlist section "Coming Soon" → `leads` insert with `source=universe_waitlist`.
- `/success`:
  - Verifies session via `fulfill-purchase`, shows signed downloads + premium unlock note.
  - Persists `session_id` to `localStorage.nk_session_id` so `/chronicles` can unlock premium audio.
  - Fires GA4 `purchase` event (guarded — only if `window.gtag` exists) with `referral_code`.
  - Upsell logic: bought $15 → offer $24 upgrade-to-bundle; bought $29 → offer +$10 Case Files. Both re-open `create-payment`.
  - Referral share block + CTAs to `/chronicles` and `/store`.

## Phase 4 — `/admin-upload` AI Factory 2.0

Frontend only — reuse existing `generate-episode` and `admin-serials` functions.
- Panel A: "Generate Full Episode" (already present, polish UI + preview).
- Panel B: "Generate 4-Week Batch" — uses existing `count` + `weekly_offset` params.
- Panel C: "Generate Promo Assets" — new mode `promo` added to `generate-episode`: given an `episode_id`, LLM returns `{x_thread[], reddit_post, ig_caption, video_script}`; UI shows tabs + Copy buttons with `?ref=` placeholder token.
- Preview gate: transcript viewer + inline signed-URL audio preview before flipping `is_published` via `admin-serials`.
- List view: toggle published/premium, delete, preview audio — all via `admin-serials`.

## Phase 5 — Growth loops

New pages, all statically rendered, SEO'd, and reading `localStorage.nk_ref`:
- `/share` — promo kit: X thread, Reddit copy, IG, TikTok captions with copy buttons.
- `/referrals` — explains ref tracking (`leads.referral_code` + Stripe metadata), anonymized leaderboard teaser (reads count grouped by `referral_code` from `leads` via a public RPC `get_referral_counts()` returning only aggregated counts — no emails exposed).
- `/universe` — HeroDossier vision + IP-launch waitlist email → `leads` with `source=universe_waitlist`.
- Nav + Footer: add X @NakeKnightIP, IG, TikTok, YouTube, plus `/share`, `/referrals`, `/universe`.

## Phase 6 — Hardening

- Rate limit `leads` inserts: add SQL function `insert_lead_rate_limited(email, source, referral_code, user_agent)` that rejects >5 inserts per email per hour. Frontend calls the RPC instead of direct insert.
- Verify: no public write policies on any public table; `chronicles` and `digital-products` buckets remain private (audit query in migration comment).
- `/success` always re-verifies via `fulfill-purchase` (already true).
- Premium audio: never returned as raw path — only signed URL from `fulfill-purchase` (already true).

## Backend changes

1. **Migration**:
   - `create or replace function public.insert_lead_rate_limited(...)` (security definer, search_path=public) — inserts into `leads` with a rolling 1h/5 cap per email.
   - `create or replace function public.get_referral_counts()` returning `(referral_code text, referrals bigint)` — aggregated only.
   - `grant execute` on both to `anon, authenticated`.
2. **Edge function `generate-episode`**: add optional `mode: "promo"` branch that reads `weekly_serials` row and asks Lovable AI for the promo bundle. No schema change.
3. **Edge function `create-payment`**: accept `items: [{price, quantity}]` array (already supported) — used for the $39 bundle by sending both prices.

## Frontend files

Created:
- `src/components/FloatingShareButton.tsx`
- `src/components/RefCapture.tsx`
- `src/components/UniverseValueStack.tsx`
- `src/components/JoinPeaceProject.tsx`
- `src/components/BingeMode.tsx` (small hook + toggle)
- `src/pages/Referrals.tsx`
- `src/pages/Universe.tsx`
- `src/assets/og-chronicles.jpg` (generated)

Modified:
- `src/App.tsx` (routes + `<RefCapture />`)
- `src/pages/Index.tsx`, `src/pages/Chronicles.tsx`, `src/pages/Store.tsx`, `src/pages/Success.tsx`, `src/pages/AdminUpload.tsx`, `src/pages/Share.tsx`
- `src/components/SiteNav.tsx`, `src/components/SiteFooter.tsx`, `src/components/PeacemakerHero.tsx`
- `public/sitemap.xml`, `index.html` (OG fallback)

## Env / secrets

No new secrets. Uses existing `ADMIN_TOKEN`, Stripe keys, `CUSTOM_TTS_*`, `LOVABLE_API_KEY`. GA4 is optional; if the user later provides a measurement ID we wire `<script>` in `index.html`.

## Acceptance verification

After build I will:
1. Load `/` and confirm CTAs + countdown + email capture render.
2. Load `/chronicles` and confirm free plays, premium locks, share buttons, JSON-LD present.
3. Load `/store`, click bundle → Stripe test → `/success?session_id=...` renders downloads.
4. Load `/admin-upload`, run Generate Full Episode + Promo Assets flows.
5. Visit `/?ref=test123`, confirm ref stored, appears in Stripe metadata on next checkout.

## Out of scope (flag for follow-up)

- Real per-episode play counts (needs new `episode_plays` table + tracking endpoint). Not built unless you confirm.
- Real GA4 wiring (needs measurement ID).
- Podcast RSS feed export (can add as an edge function next round).
- Comments/discussion per episode (needs a new `episode_comments` table + policies + moderation — sizable; deferred).
