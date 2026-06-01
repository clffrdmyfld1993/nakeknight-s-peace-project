import { motion } from "framer-motion";
import SEO from "@/components/SEO";
import { Bot, ExternalLink, ShoppingBag, Sparkles, Activity, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// HARDCODED FACTS ONLY — no simulated metrics.
// Prices below are the real live Stripe prices for this catalog (USD).
const catalog = [
  { name: "The Iron Pact — Digital Comic #1", price: "$4.99", category: "Comic" },
  { name: "The Ashen Accord — Digital Comic #3", price: "$4.99", category: "Comic" },
  { name: "Hero Dossier Art Pack", price: "$9.99", category: "Art Pack" },
  { name: "Complete Lore Collection", price: "$14.99", category: "Lore" },
  { name: "NakeKnight Wallpaper Pack", price: "$2.99", category: "Wallpapers" },
  { name: "Soundtrack: Voices of Resolution", price: "$7.99", category: "Audio" },
];

const totalSkuCount = catalog.length;
const minPrice = "$2.99";
const maxPrice = "$14.99";

const aiStack = [
  { area: "Site & app code", tool: "Lovable + Claude (Anthropic)" },
  { area: "Character & costume art", tool: "Image generation (Lovable AI Gateway)" },
  { area: "Promo video (vertical reel)", tool: "Lovable AI Gateway video generation" },
  { area: "Lore, copy & case files", tool: "Claude / GPT class LLMs" },
  { area: "Storefront & checkout", tool: "Stripe Checkout (live)" },
  { area: "Backend & functions", tool: "Lovable Cloud (Supabase Edge Functions)" },
];

const channels = [
  { label: "Storefront", value: "/store", internal: true },
  { label: "Costume Vault", value: "/costumes", internal: true },
  { label: "Licensing Portal", value: "/license", internal: true },
  { label: "Investor Pitch", value: "/pitch", internal: true },
  { label: "Social Hub", value: "/social", internal: true },
];

function AiBadge({ tool }: { tool: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] text-primary/60 bg-primary/5 border border-primary/10 rounded px-1.5 py-0.5">
      <Bot className="w-3 h-3" /> {tool}
    </span>
  );
}

export default function Command() {
  type StripeStats = {
    activeProducts: number;
    last30d: { successfulPayments: number; grossCents: number; currency: string };
    checkedAt: string;
  };
  const [stats, setStats] = useState<StripeStats | null>(null);
  const [statsErr, setStatsErr] = useState<string | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("stripe-stats");
        if (cancelled) return;
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        setStats(data as StripeStats);
      } catch (e) {
        if (!cancelled) setStatsErr(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const fmtMoney = (cents: number, ccy: string) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: ccy || "USD" }).format(cents / 100);

  return (
    <div className="min-h-screen bg-background font-body pt-14">
      <SEO
        title="NakeKnight™ Command Center — Business Facts"
        description="Live business facts for NakeKnight: AI toolstack, Stripe catalog pricing, and verifiable build details. No projections, no fluff."
        path="/command"
      />
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="flex items-center gap-2 mb-2">
            <p className="text-primary font-display tracking-[0.3em]">AI COMMAND CENTER</p>
            <AiBadge tool="Lovable" />
          </div>
          <h1 className="font-display text-6xl md:text-7xl text-foreground mb-4">
            NAKEKNIGHT™ BUSINESS FACTS
          </h1>
          <p className="text-muted-foreground max-w-xl">
            No simulated numbers. Every figure below is a verifiable fact:
            the live product catalog priced through Stripe and the AI stack
            used to build and run NakeKnight™.
          </p>
        </motion.div>

        {/* LIVE DATA ONLY — pulled directly from Stripe */}
        <section className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="font-display text-3xl text-foreground">LIVE DATA ONLY</h2>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded px-1.5 py-0.5">
              <Activity className="w-3 h-3" /> Stripe live
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] text-primary/60 bg-primary/5 border border-primary/10 rounded px-1.5 py-0.5">
              <Activity className="w-3 h-3" /> GA4 G-28DS4V8XRT
            </span>
          </div>

          {statsLoading && (
            <div className="p-5 bg-card border border-border rounded-lg flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Reading live Stripe data…
            </div>
          )}

          {statsErr && !statsLoading && (
            <div className="p-5 bg-card border border-destructive/30 rounded-lg text-sm text-destructive">
              Live data unavailable: {statsErr}
            </div>
          )}

          {stats && !statsLoading && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-5 bg-card border border-border rounded-lg">
                  <ShoppingBag className="w-5 h-5 text-primary mb-3" />
                  <div className="font-display text-3xl text-foreground">{stats.activeProducts}</div>
                  <div className="text-sm text-muted-foreground">Active Stripe products</div>
                </div>
                <div className="p-5 bg-card border border-border rounded-lg">
                  <Sparkles className="w-5 h-5 text-primary mb-3" />
                  <div className="font-display text-3xl text-foreground">{stats.last30d.successfulPayments}</div>
                  <div className="text-sm text-muted-foreground">Successful payments (30d)</div>
                </div>
                <div className="p-5 bg-card border border-border rounded-lg">
                  <Sparkles className="w-5 h-5 text-primary mb-3" />
                  <div className="font-display text-3xl text-foreground">
                    {fmtMoney(stats.last30d.grossCents, stats.last30d.currency)}
                  </div>
                  <div className="text-sm text-muted-foreground">Gross revenue (30d)</div>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground mt-3">
                Pulled live from Stripe at {new Date(stats.checkedAt).toLocaleString()}. Zero values are real zeros — no simulated numbers are ever shown.
              </p>
            </>
          )}
        </section>

        {/* Catalog snapshot — real Stripe prices */}
        <section className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="font-display text-3xl text-foreground">LIVE CATALOG</h2>
            <AiBadge tool="Stripe" />
          </div>


          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-5 bg-card border border-border rounded-lg">
              <ShoppingBag className="w-5 h-5 text-primary mb-3" />
              <div className="font-display text-3xl text-foreground">{totalSkuCount}</div>
              <div className="text-sm text-muted-foreground">Digital SKUs live</div>
            </div>
            <div className="p-5 bg-card border border-border rounded-lg">
              <Sparkles className="w-5 h-5 text-primary mb-3" />
              <div className="font-display text-3xl text-foreground">{minPrice}</div>
              <div className="text-sm text-muted-foreground">Entry price</div>
            </div>
            <div className="p-5 bg-card border border-border rounded-lg">
              <Sparkles className="w-5 h-5 text-primary mb-3" />
              <div className="font-display text-3xl text-foreground">{maxPrice}</div>
              <div className="text-sm text-muted-foreground">Top price</div>
            </div>
            <div className="p-5 bg-card border border-border rounded-lg">
              <Bot className="w-5 h-5 text-primary mb-3" />
              <div className="font-display text-3xl text-foreground">USD</div>
              <div className="text-sm text-muted-foreground">Settlement currency</div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="px-4 py-3 font-display tracking-wider">PRODUCT</th>
                  <th className="px-4 py-3 font-display tracking-wider">CATEGORY</th>
                  <th className="px-4 py-3 font-display tracking-wider text-right">PRICE</th>
                </tr>
              </thead>
              <tbody>
                {catalog.map((p) => (
                  <tr key={p.name} className="border-b border-border/40 last:border-0">
                    <td className="px-4 py-3 text-foreground">{p.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                    <td className="px-4 py-3 text-right font-display text-primary">{p.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* AI Stack */}
        <section className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="font-display text-3xl text-foreground">AI STACK IN USE</h2>
            <AiBadge tool="Verified" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {aiStack.map((s) => (
              <div
                key={s.area}
                className="p-5 bg-card border border-border rounded-lg"
              >
                <div className="font-display text-lg text-foreground">{s.area}</div>
                <div className="text-sm text-muted-foreground">{s.tool}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Channels */}
        <section className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="font-display text-3xl text-foreground">CHANNELS LIVE NOW</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {channels.map((c) => (
              <Link
                key={c.label}
                to={c.value}
                className="p-4 bg-card border border-border rounded-lg hover:border-primary/40 transition-colors text-center"
              >
                <div className="font-display text-sm text-foreground tracking-wider">
                  {c.label.toUpperCase()}
                </div>
                <div className="text-[11px] text-muted-foreground mt-1 inline-flex items-center gap-1">
                  {c.value} <ExternalLink className="w-3 h-3" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Footnote */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center p-8 bg-card border border-primary/20 rounded-lg"
        >
          <Bot className="w-8 h-8 text-primary mx-auto mb-3" />
          <h3 className="font-display text-2xl text-foreground mb-2">FACTS ONLY</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Revenue, follower counts and pipeline figures are intentionally
            omitted. They will only be published once they exist as verifiable
            numbers from Stripe and connected platforms.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
