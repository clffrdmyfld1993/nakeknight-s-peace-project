# NakeKnight — The Workplace Peacemaker

Independent React/Vite site for NakeKnight, a creator-led, LGBTQIA+-positive superhero universe about resolving everyday conflict through practical, nonviolent communication.

## Local build

```sh
npm ci
npm run build
npm run preview
```

The front end reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` at build time. Never commit real environment values.

## Hosting target

The independent Sonic Kurrent site is being prepared for `nakeknight.sonickurrent.space`. The existing Supabase functions still contain Lovable AI and Google Search Console gateway dependencies; those integrations require an independently reviewed provider and credential migration before they can be considered portable.
