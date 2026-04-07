

# NakeKnight™ — AI-Powered Business Platform

## Vision
Transform the NakeKnight site from a hero dossier into a full AI-powered business platform that demonstrates how someone can go from idea to revenue using nothing but AI. The site itself becomes the proof of concept.

## What We're Building

### 1. AI Business Command Center (New Page: `/command`)
A public-facing "multidimensional dashboard" showcasing NakeKnight as a living, AI-driven business. Sections:
- **Revenue Streams** — animated cards showing merch, digital content, licensing tiers with live-looking counters
- **Partnership Pipeline** — visual funnel showing outreach → contact → signed deals (mock data styled to look real-time)
- **Content Engine** — shows AI-generated lore, case files, artwork being "produced" with typing/generation animations
- **Community Pulse** — social metrics, LGBTQIA+ community engagement stats
- **"Built With AI" Badge** — every section has a subtle tag showing which AI tool made it

### 2. Digital Content Store (New Page: `/store`)
Storefront for selling NakeKnight digital content, connected to the user's hosted Medusa instance:
- Comic issues, art packs, exclusive lore PDFs, wallpapers
- Product cards with NakeKnight branding
- Cart + checkout flow calling Medusa's storefront API
- Initially built with mock product data; Medusa API URL wired in when provided

### 3. Licensing Portal (New Page: `/license`)
A page for brands/studios to explore partnership tiers:
- **Tier cards**: Merch License, Comic/Publishing, Games/Interactive, Film/Media
- Each tier shows what's included, pricing range, and a "Request License" form
- Form sends inquiry to `afterglow619@proton.me` via a `mailto:` link (no backend needed)
- AI-generated pitch language for each tier

### 4. Investor Pitch Page (New Page: `/pitch`)
An interactive, scroll-driven pitch deck built as a web page:
- Problem → Solution → Market → Traction → Team → Ask
- Animated stats, parallax sections, NakeKnight artwork
- "Download PDF" button (links to the generated pitch kit)
- Seed funding ask with use-of-funds breakdown

### 5. "Built By AI" Narrative Section
Added to the homepage — a dedicated section explaining:
- "This entire business was built with AI — from character design to outreach emails to this website"
- Timeline showing each AI-powered step taken
- Call-to-action: "You can do this too"

## Technical Approach

- **Routing**: Add 4 new routes in `App.tsx` (`/command`, `/store`, `/license`, `/pitch`)
- **Shared nav**: Create a persistent top navigation bar across all pages
- **Components**: Each page gets its own component file under `src/pages/`
- **Animations**: Continue using Framer Motion + existing design system (Bebas Neue headings, dark warm palette, amber primary)
- **Medusa integration**: Create a `src/lib/medusa.ts` client that calls the Medusa storefront API. Products fetched via `GET /store/products`. Cart managed client-side. Checkout redirects to Medusa. URL stored as env var — mock data used until configured.
- **No backend needed initially**: Forms use `mailto:`, store uses Medusa API directly, dashboard uses mock data with animated counters
- **Recharts**: Already installed — used for dashboard visualizations

## Pages Summary

| Page | Purpose | Key Feature |
|------|---------|-------------|
| `/` | Hero dossier (existing) + "Built By AI" section | Proves the concept |
| `/command` | Public business dashboard | Shows AI running a business |
| `/store` | Digital content storefront | Revenue via Medusa |
| `/license` | Licensing portal for partners | Attracts brand deals |
| `/pitch` | Interactive investor pitch | Gets seed funding |

## Implementation Order
1. Shared navigation component
2. Command Center dashboard (`/command`)
3. Digital Store with Medusa client (`/store`)
4. Licensing Portal (`/license`)
5. Investor Pitch page (`/pitch`)
6. "Built By AI" section on homepage
7. Polish animations and cross-page consistency

