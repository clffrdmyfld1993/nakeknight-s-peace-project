import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { TIERS, ORDER_BUMP } from "@/lib/catalog";
import { startCheckout } from "@/components/OfferLadder";
import { gaAddToCart, gaBeginCheckout, gaViewItem, itemsFromPrices } from "@/lib/ga4";
import TrustStrip from "@/components/TrustStrip";

const PROGRESS_KEY = "nk_dossier_progress";

function readProgress(): string[] {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/** Marks a SKU as collected so the "complete the set" banner can nudge. */
export function markCollected(sku: string) {
  try {
    const next = Array.from(new Set([...readProgress(), sku]));
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
  } catch {
    /* noop */
  }
}

const DOSSIER_PARTS = ["Build PDF", "Lore PDF", "Render Pack", "Variant Covers"];

export default function BundleTiers({ source = "store" }: { source?: string }) {
  const [selected, setSelected] = useState<string>("creator");
  const [bump, setBump] = useState(false);
  const [loading, setLoading] = useState(false);
  const [collected, setCollected] = useState<string[]>([]);

  useEffect(() => {
    setCollected(readProgress());
    gaViewItem(itemsFromPrices(TIERS.map((t) => t.stripePriceId)));
  }, []);

  const tier = TIERS.find((t) => t.key === selected) ?? TIERS[1];

  const buy = (key: string) => {
    const chosen = TIERS.find((t) => t.key === key) ?? TIERS[1];
    const prices = bump
      ? [chosen.stripePriceId, ORDER_BUMP.stripePriceId]
      : [chosen.stripePriceId];
    setSelected(key);
    setLoading(true);
    gaAddToCart(itemsFromPrices(prices));
    gaBeginCheckout(itemsFromPrices(prices));
    markCollected(chosen.sku);
    startCheckout(prices, `${source}_${chosen.sku}`, () => setLoading(false));
  };

  const remaining = DOSSIER_PARTS.length - Math.min(collected.length, DOSSIER_PARTS.length);

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <p className="font-display tracking-[0.3em] text-xs text-primary mb-2">PICK YOUR PACK</p>
      <h2 className="font-display text-4xl md:text-5xl text-foreground mb-8">
        THE DOSSIER, THREE WAYS
      </h2>

      <div className="grid md:grid-cols-3 gap-4 items-stretch">
        {TIERS.map((t, i) => {
          const highlighted = t.key === "creator";
          return (
            <motion.div
              key={t.key}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className={`relative p-6 rounded-lg flex flex-col border ${
                highlighted
                  ? "bg-primary/10 border-primary shadow-[0_0_60px_-30px_hsl(var(--primary))] md:-mt-3"
                  : "bg-card border-border"
              }`}
            >
              {t.badge && (
                <span className="absolute top-3 right-3 px-2 py-0.5 bg-primary text-primary-foreground font-display text-[9px] tracking-widest rounded-sm">
                  {t.badge}
                </span>
              )}
              <h3 className="font-display text-2xl text-foreground mb-1">{t.name}</h3>
              <p className="text-[11px] tracking-widest text-muted-foreground mb-4">{t.sku}</p>

              <div className="mb-4">
                {t.valueLabel && (
                  <span className="text-sm text-muted-foreground line-through mr-2">
                    {t.valueLabel}
                  </span>
                )}
                <span className="font-display text-3xl text-primary">{t.priceLabel}</span>
                {t.saveLabel && (
                  <span className="ml-2 text-[10px] font-display tracking-widest text-primary">
                    {t.saveLabel}
                  </span>
                )}
              </div>

              <ul className="space-y-2 mb-6 flex-1">
                {t.includes.map((line) => (
                  <li key={line} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                    {line}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => buy(t.key)}
                disabled={loading}
                className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 font-display text-xs tracking-widest rounded-sm disabled:opacity-60 ${
                  highlighted
                    ? "bg-primary text-primary-foreground hover:opacity-90"
                    : "bg-primary/10 text-primary hover:bg-primary/20"
                }`}
              >
                {loading && selected === t.key && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                )}
                GET {t.name.toUpperCase()}
              </button>
            </motion.div>
          );
        })}
      </div>

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
          {ORDER_BUMP.blurb} Added to whichever tier you pick above.
        </span>
      </label>

      <TrustStrip className="mt-4" />

      {collected.length > 0 && remaining > 0 && (
        <p className="mt-4 p-3 bg-primary/5 border border-primary/30 rounded-md text-sm text-muted-foreground">
          <span className="font-display tracking-widest text-primary text-xs">DOSSIER PROGRESS</span>{" "}
          — {Math.min(collected.length, DOSSIER_PARTS.length)}/{DOSSIER_PARTS.length} collected.
          Complete the set with the {TIERS[2].name} for {TIERS[2].priceLabel}.
        </p>
      )}

      {/* Comparison table */}
      <div className="mt-10 overflow-x-auto">
        <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
          <caption className="sr-only">Bundle tier comparison</caption>
          <thead className="bg-card">
            <tr>
              <th scope="col" className="text-left p-3 font-display text-xs tracking-widest text-muted-foreground">
                WHAT'S INSIDE
              </th>
              {TIERS.map((t) => (
                <th key={t.key} scope="col" className="p-3 font-display text-xs tracking-widest text-foreground">
                  {t.name.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              "Brick Build PDF",
              "Parts CSV",
              "Stud.io source file",
              "Lore PDF",
              "4K Render Pack",
              "Variant covers",
              "Prompt log",
              "Timelapse build video",
            ].map((row, idx) => (
              <tr key={row} className="border-t border-border">
                <th scope="row" className="text-left p-3 font-normal text-muted-foreground">
                  {row}
                </th>
                {TIERS.map((t, ti) => {
                  const included = ti === 0 ? idx < 3 : ti === 1 ? idx < 5 : true;
                  return (
                    <td key={t.key} className="p-3 text-center">
                      {included ? (
                        <Check className="w-4 h-4 text-primary inline" aria-label="Included" />
                      ) : (
                        <span className="text-muted-foreground" aria-label="Not included">
                          —
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
