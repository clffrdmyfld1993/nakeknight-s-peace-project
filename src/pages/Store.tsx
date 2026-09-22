import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2, Lock, ShieldCheck, Zap } from "lucide-react";
import { toast } from "sonner";
import SEO from "@/components/SEO";
import { startCheckout } from "@/components/OfferLadder";
import { useAnalytics } from "@/hooks/useAnalytics";
import { ORDER_BUMP, SINGLES, TIERS } from "@/lib/catalog";
import ogImage from "@/assets/og/brick-build-og.jpg";

/**
 * Two SKUs only. At low traffic, choice is the conversion killer —
 * one hero product and one bundle, both instant digital downloads.
 * Everything else stays live in Stripe for purchase history.
 */
const HERO = {
  sku: SINGLES.brickBuild.sku,
  name: "Brick Build PDF",
  headline: "NakeKnight Brick Build — Printable PDF",
  price: 5.99,
  priceLabel: "$5.99",
  stripePriceId: SINGLES.brickBuild.stripePriceId,
  badge: "BEST SELLER",
  includes: [
    "Step-by-step build instruction PDF (print-ready)",
    "Full parts list as CSV",
    "Stud.io source file — remix it yourself",
  ],
  blurb:
    "The complete brick-compatible build of the NakeKnight armour. Instructions, parts list and editable source file, downloadable the moment payment clears.",
};

const BUNDLE = {
  sku: TIERS[1].sku,
  name: "Creator Pack",
  headline: "Creator Pack — Build + Lore + 4K Renders",
  price: 15.99,
  priceLabel: "$15.99",
  stripePriceId: TIERS[1].stripePriceId,
  badge: "BEST VALUE",
  includes: [
    "Everything in the Brick Build PDF",
    "Full illustrated Lore PDF",
    "4K Render Pack — 5 print-grade images",
  ],
  blurb:
    "Everything in one download. Bought separately this is $24.97 — the pack is $15.99.",
  valueLabel: "$24.97",
};

const OPTIONS = [HERO, BUNDLE];

function TrustRow() {
  const rows = [
    { icon: Lock, label: "Secure via Stripe", sub: "Link · Apple Pay · Google Pay · Card" },
    { icon: Zap, label: "Instant download", sub: "No email list. Ever." },
    { icon: ShieldCheck, label: "7-day guarantee", sub: "Full refund, no forms" },
  ];
  return (
    <ul className="grid sm:grid-cols-3 gap-2 mt-3" aria-label="Purchase guarantees">
      {rows.map(({ icon: Icon, label, sub }) => (
        <li
          key={label}
          className="flex items-start gap-2 p-2.5 bg-card/60 border border-border rounded-md"
        >
          <Icon className="w-4 h-4 shrink-0 mt-0.5 text-primary" aria-hidden="true" />
          <span className="min-w-0">
            <span className="block font-display text-[10px] tracking-widest text-foreground">
              {label.toUpperCase()}
            </span>
            <span className="block text-[11px] leading-snug text-muted-foreground">{sub}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function Store() {
  const [selected, setSelected] = useState(HERO.sku);
  const [bump, setBump] = useState(false);
  const [loading, setLoading] = useState(false);
  const { viewItem, addToCart, beginCheckout } = useAnalytics();

  useEffect(() => {
    viewItem(OPTIONS.map((o) => o.sku));
    const status = new URLSearchParams(window.location.search).get("status");
    if (status === "canceled") toast("Checkout canceled — nothing was charged.");
    if (status) window.history.replaceState({}, "", "/store");
  }, [viewItem]);

  const chosen = OPTIONS.find((o) => o.sku === selected) ?? HERO;
  const total = useMemo(
    () => chosen.price + (bump ? ORDER_BUMP.price : 0),
    [chosen, bump],
  );

  const buy = (sku: string) => {
    const option = OPTIONS.find((o) => o.sku === sku) ?? HERO;
    setSelected(sku);
    const skus = bump ? [option.sku, ORDER_BUMP.sku] : [option.sku];
    const prices = bump
      ? [option.stripePriceId, ORDER_BUMP.stripePriceId]
      : [option.stripePriceId];
    addToCart(skus);
    beginCheckout(skus);
    setLoading(true);
    startCheckout(prices, `store_${option.sku}`, () => setLoading(false));
  };

  const productLd = OPTIONS.map((o) => ({
    "@context": "https://schema.org",
    "@type": "Product",
    name: o.headline,
    sku: o.sku,
    description: o.blurb,
    brand: { "@type": "Brand", name: "NakeKnight" },
    image: `https://herodossier.lovable.app${ogImage}`,
    offers: {
      "@type": "Offer",
      price: o.price.toFixed(2),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: "https://herodossier.lovable.app/store",
      itemCondition: "https://schema.org/NewCondition",
    },
  }));

  return (
    <div className="min-h-screen bg-background font-body pt-14 pb-28">
      <SEO
        title="NakeKnight Brick Build PDF — Instructions $5.99 Instant Download"
        description="Brick-compatible NakeKnight build: printable instruction PDF, parts CSV and Stud.io file for $5.99. Instant download, no email list, 7-day guarantee."
        path="/store"
        image={ogImage}
        jsonLd={productLd}
      />

      <div className="max-w-5xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <p className="text-primary font-display tracking-[0.3em] mb-2">DIGITAL ARMORY</p>
          <h1 className="font-display text-5xl md:text-6xl text-foreground mb-4">
            NAKEKNIGHT BRICK BUILD — INSTANT PDF
          </h1>
          <p className="text-muted-foreground max-w-xl">
            Two ways to buy. Both are instant downloads — no shipping, no account,
            no mailing list. Your email is used once, to send the file link.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-4 items-stretch">
          {OPTIONS.map((o, i) => {
            const active = o.sku === selected;
            return (
              <motion.article
                key={o.sku}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                onMouseEnter={() => setSelected(o.sku)}
                className={`relative p-6 rounded-lg flex flex-col border ${
                  active
                    ? "bg-primary/10 border-primary shadow-[0_0_60px_-30px_hsl(var(--primary))]"
                    : "bg-card border-border"
                }`}
              >
                <span className="absolute top-3 right-3 px-2 py-0.5 bg-primary text-primary-foreground font-display text-[9px] tracking-widest rounded-sm">
                  {o.badge}
                </span>
                <h2 className="font-display text-2xl text-foreground mb-1">{o.name}</h2>
                <p className="text-[11px] tracking-widest text-muted-foreground mb-4">{o.sku}</p>
                <p className="text-sm text-muted-foreground mb-4">{o.blurb}</p>

                <div className="mb-4">
                  {"valueLabel" in o && o.valueLabel && (
                    <span className="text-sm text-muted-foreground line-through mr-2">
                      {o.valueLabel}
                    </span>
                  )}
                  <span className="font-display text-4xl text-primary">{o.priceLabel}</span>
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {o.includes.map((line) => (
                    <li key={line} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                      {line}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => buy(o.sku)}
                  disabled={loading}
                  className={`inline-flex items-center justify-center gap-2 px-4 py-3 font-display text-xs tracking-widest rounded-sm disabled:opacity-60 ${
                    active
                      ? "bg-primary text-primary-foreground hover:opacity-90"
                      : "bg-primary/10 text-primary hover:bg-primary/20"
                  }`}
                >
                  {loading && active && <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />}
                  BUY {o.priceLabel} — INSTANT DOWNLOAD
                </button>
              </motion.article>
            );
          })}
        </div>

        {/* Trust row sits directly under the buy buttons */}
        <TrustRow />

        {/* Order bump */}
        <label className="mt-4 flex items-start gap-3 p-4 bg-card border border-dashed border-primary/40 rounded-lg cursor-pointer">
          <span
            className={`mt-0.5 w-4 h-4 shrink-0 rounded-sm border flex items-center justify-center ${
              bump ? "bg-primary border-primary" : "border-muted-foreground/50"
            }`}
          >
            {bump && <Check className="w-3 h-3 text-primary-foreground" aria-hidden="true" />}
          </span>
          <input
            type="checkbox"
            className="sr-only"
            checked={bump}
            onChange={(e) => setBump(e.target.checked)}
          />
          <span className="text-sm text-muted-foreground">
            <span className="text-foreground font-display tracking-wide">
              ADD {ORDER_BUMP.name.toUpperCase()} — {ORDER_BUMP.priceLabel} MORE
            </span>
            <br />
            {ORDER_BUMP.blurb}
          </span>
        </label>

        <p className="mt-6 text-xs text-muted-foreground">
          Digital goods only — no shipping address is ever collected. Email is
          requested at checkout purely to deliver your file link, and is never
          marketed to.
        </p>
      </div>

      {/* Sticky order summary — total is final, no surprises at the last step */}
      <div className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur">
        <div className="max-w-5xl mx-auto px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm">
            <span className="font-display tracking-widest text-[10px] text-muted-foreground block">
              ORDER SUMMARY
            </span>
            <span className="text-foreground">
              {chosen.name}
              {bump && ` + ${ORDER_BUMP.name}`} —{" "}
              <span className="font-display text-primary">${total.toFixed(2)}</span>{" "}
              <span className="text-muted-foreground">total, tax and fees included</span>
            </span>
          </div>
          <button
            onClick={() => buy(chosen.sku)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-display text-xs tracking-widest rounded-sm hover:opacity-90 disabled:opacity-60"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />}
            CHECKOUT ${total.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
}
