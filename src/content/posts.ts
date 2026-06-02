// Blog content for NakeKnight™.
// SEO pipeline targets the "AI-driven businesses" keyword cluster
// (AI-native brands, AI-built IP, single-operator AI companies).
// To add a post: append to POSTS and re-publish — sitemap + Article JSON-LD
// pick it up automatically.

export type PostCategory = "Case Studies" | "AI Breakdown";

export interface BlogPost {
  slug: string;
  title: string;
  description: string; // <160 chars, used for <meta description> and og:description
  category: PostCategory;
  publishedAt: string; // ISO date
  updatedAt?: string;
  readingMinutes: number;
  keywords: string[]; // ranking targets — surfaced as <meta name="keywords">
  // Markdown-ish body. Rendered with a tiny formatter (h2 / h3 / paragraphs / lists).
  body: string;
}

export const CATEGORIES: PostCategory[] = ["Case Studies", "AI Breakdown"];

// Core SEO cluster — every post should target at least one of these phrases.
export const KEYWORD_CLUSTER = [
  "AI-driven businesses",
  "AI-native brand",
  "AI-built IP",
  "AI-built company",
  "solo founder AI",
  "AI entertainment company",
];

export const POSTS: BlogPost[] = [
  {
    slug: "what-is-an-ai-driven-business",
    title: "What Is an AI-Driven Business? A Working Definition for 2026",
    description:
      "An AI-driven business uses AI as the primary labor source — design, code, ops, copy. Here's the definition, the test, and how NakeKnight qualifies.",
    category: "AI Breakdown",
    publishedAt: "2026-06-02",
    readingMinutes: 6,
    keywords: ["AI-driven businesses", "AI-native brand", "AI-first company"],
    body: `
## The short definition

An **AI-driven business** is a company where AI tooling — not headcount —
performs the majority of value-creating work: design, engineering,
copywriting, operations, and customer support. Humans set direction,
approve outputs, and own the brand. AI does the production.

This is different from a business that "uses AI." Almost every company
uses AI now. An AI-driven business is structured around AI from day one.

## The three-part test

A business is AI-driven if it meets all three:

- **Labor mix** — More than 70% of the work that ships to customers is
  produced with AI tools, not contracted out or done by employees.
- **Cost structure** — Tooling and compute exceed payroll. The line
  item that scales is usage, not seats.
- **Pace** — Time from idea to live artifact (page, product, video,
  invoice) is measured in hours, not weeks.

## Why this matters now

For most of the last decade, "AI company" meant "company selling AI."
The interesting shift in 2026 is the second category: companies that
*are run by* AI. The cost of producing branded content, code, and
operations collapsed to near-zero in 2024–2025, which opened a door
for one-person companies to compete with mid-sized studios.

## How NakeKnight qualifies

NakeKnight is a working case study. The IP, site, store, pitch deck,
licensing portal, and analytics dashboards were all built and shipped
by a single operator using AI tools. Every public metric we publish
is wired to a live source — Stripe for sales, Search Console for
indexing — because the entire pitch is verifiability.

See [the NakeKnight About page](/about) for the verifiable facts,
and [the live Stripe-backed catalog](/store) for the proof.

## What's next

The interesting questions for AI-driven businesses now are about
governance, not capability. Who owns the prompts? Who is liable when
the model hallucinates a refund policy? How do you do due diligence
on a company with no employees? We'll cover each of those in this
series.
`,
  },
  {
    slug: "ai-driven-business-vs-ai-enabled-business",
    title: "AI-Driven vs AI-Enabled: Why the Distinction Matters",
    description:
      "Most companies are AI-enabled. Very few are AI-driven. Here's how to tell the difference and why investors and partners should care.",
    category: "AI Breakdown",
    publishedAt: "2026-06-02",
    readingMinutes: 5,
    keywords: ["AI-driven businesses", "AI-enabled business", "AI-native brand"],
    body: `
## Two categories that get confused

**AI-enabled** businesses bolt AI onto an existing org chart. A
marketing team uses ChatGPT to draft posts faster. A support team
routes tickets with an LLM. The org chart doesn't change.

**AI-driven** businesses don't have the org chart in the first place.
The "marketing team" is a prompt library. The "support team" is an
agent with escalation rules. Headcount is replaced with tools.

## Why it matters for partners

If you're licensing IP, investing, or buying from one of these
companies, the difference shows up in three places:

- **Speed of iteration.** AI-driven shops ship a new landing page in
  the time it takes an AI-enabled shop to schedule a meeting about it.
- **Margin profile.** No payroll means revenue drops to the operator
  instead of being split across a team.
- **Resilience.** A single operator + AI stack has lower fixed costs
  but also a single point of failure. Worth diligence.

## The honest tradeoffs

AI-driven isn't strictly better. It's a different shape. Teams beat
solo operators on:

- Original research and reporting that requires being somewhere.
- Long sales cycles that need relationship continuity.
- Deep domain expertise that hasn't been trained into the models yet.

AI-driven beats teams on:

- Visual production volume (covers, illustrations, video).
- Multi-surface consistency (site, deck, store, social).
- Throughput on well-defined repeatable work.

## Where NakeKnight sits

NakeKnight is the AI-driven extreme: one operator, full AI stack,
everything verifiable on the public site. See
[the pitch page](/pitch) for the live numbers and
[the press kit](/press) for the boilerplate.
`,
  },
  {
    slug: "nakeknight-build-log-from-prompt-to-stripe",
    title: "NakeKnight Build Log: From Prompt to Live Stripe Checkout",
    description:
      "How an AI-driven business goes from a one-line prompt to a live storefront with real Stripe checkout and indexed pages — in days, not quarters.",
    category: "Case Studies",
    publishedAt: "2026-06-02",
    readingMinutes: 7,
    keywords: ["AI-driven businesses", "AI-built company", "AI-native brand"],
    body: `
## The starting point

NakeKnight began as a single sentence: *"What if there were an
entertainment IP that was provably built by AI, with every public
number wired to a real source?"* No team, no agency, no outside
capital. The thesis was that an AI-driven workflow could produce
something a small studio couldn't — not because the AI is smarter,
but because nothing was waiting on anyone.

## What shipped, in order

The build order matters because it shows where AI-driven workflows
compress time.

- **Day 1 — Brand + site shell.** Logo direction, type, color, the
  first two routes (Dossier and Command).
- **Day 2 — Catalog.** Six digital SKUs created in Stripe, then
  surfaced through a typed edge function so the site reads from the
  same source of truth as checkout.
- **Day 3 — Pitch + licensing.** Investor pitch page, four-tier
  licensing portal, inquiry form that opens an email to the
  operator. No CRM, no Calendly — just the inbox.
- **Day 4 — Verification surface.** Search Console verified,
  sitemap submitted, GA4 wired sitewide, coverage page added so
  anyone can see indexing status without logging into a dashboard.

## The unfair advantage

The unfair advantage isn't speed — it's *coherence*. Because one
operator + AI made every surface, the headline copy on the home
page matches the licensing tier description on /license matches the
press boilerplate on /press. Most studios lose that fidelity by the
time the deck reaches a partner.

## What broke

A few honest failures worth naming:

- **Hardcoded numbers.** Early drafts of the pitch page invented
  projections. Those were ripped out — the page now only shows
  verifiable facts wired to Stripe or "$0 raised."
- **JSON-LD drift.** Schemas on multiple pages referenced different
  founding dates. Fixed by centralizing constants.
- **Sitemap lag.** New routes shipped without sitemap updates twice.
  Now part of every "new page" checklist.

## The takeaway for other AI-driven businesses

If you're building an AI-driven brand, the rule that pays off the
most: **wire everything to a live source from day one.** It's tempting
to ship a screenshot of a dashboard. Ship the dashboard.
`,
  },
  {
    slug: "single-operator-ai-stack-2026",
    title: "The Single-Operator AI Stack We Used to Ship NakeKnight",
    description:
      "Every tool in the AI stack one operator used to build a verifiable AI-driven business: site, store, pitch, video, and analytics.",
    category: "Case Studies",
    publishedAt: "2026-06-02",
    readingMinutes: 6,
    keywords: ["AI-driven businesses", "solo founder AI", "AI stack"],
    body: `
## The stack

Listed in roughly the order they're used in a typical build day.

- **Lovable** — the entire web surface (React + Vite + Tailwind),
  edge functions, and the connection to the backend (Lovable Cloud,
  which is a managed Supabase under the hood).
- **Claude / GPT** — copy, JSON-LD planning, schema reviews,
  TypeScript scaffolding.
- **Midjourney / Nano Banana** — character and cover art.
- **Remotion** — scripted video renders for the social pipeline.
- **Stripe** — the source of truth for the catalog. Site reads from
  the same API checkout uses.
- **Google Search Console + GA4** — verification surfaces. Both are
  wired into pages on the site so the numbers are visible without a
  dashboard login.

## What we deliberately don't use

- **A CRM.** Inquiries go to the inbox. At one-operator scale, a
  CRM is overhead, not leverage.
- **A CMS.** Posts are TypeScript files. Lower friction, version
  controlled, and they ship with the rest of the app.
- **A separate analytics product.** GA4 + Search Console are enough
  to answer the only two questions that matter right now: is anyone
  arriving, and are pages getting indexed.

## The principle

The stack is small because the brand is small. As traction grows,
specific pieces will get swapped — a CMS when there are dozens of
authors, a CRM when inquiries exceed inbox triage. The goal of an
AI-driven business isn't to stay solo forever. It's to stay solo
*until the work demands otherwise*, and to make sure the public
surface stays verifiable the whole way.

See [the live store](/store) and [the live indexing coverage page](/coverage).
`,
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return POSTS.find(p => p.slug === slug);
}

export function getPostsByCategory(category: PostCategory | "All"): BlogPost[] {
  if (category === "All") return POSTS;
  return POSTS.filter(p => p.category === category);
}
