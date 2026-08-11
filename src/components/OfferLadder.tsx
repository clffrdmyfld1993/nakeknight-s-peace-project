import { motion } from "framer-motion";
import { Loader2, Crown, Repeat, FileText, Check } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { OFFERS } from "@/lib/offers";
import { getStoredRef } from "@/components/RefCapture";

export async function startCheckout(
  priceIds: string[],
  source: string,
  onDone?: () => void,
) {
  try {
    const { data, error } = await supabase.functions.invoke("create-payment", {
      body: {
        items: priceIds.map((price) => ({ price, quantity: 1 })),
        referral: getStoredRef(),
        source,
      },
    });
    if (error) throw error;
    if (!data?.url) throw new Error(data?.error || "No checkout URL returned");
    window.location.href = data.url;
  } catch (e: any) {
    toast.error(e?.message || "Checkout failed");
  } finally {
    onDone?.();
  }
}

/** The three-rung money ladder: entry, recurring, flagship. */
export default function OfferLadder({ source = "ladder" }: { source?: string }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [bump, setBump] = useState(false);

  const go = (key: string, prices: string[], allowBump = false) => {
    setLoading(key);
    const items = allowBump && bump ? [...prices, OFFERS.bump.stripePriceId] : prices;
    startCheckout(items, `${source}_${key}`, () => setLoading(null));
  };

  const spin = (k: string) =>
    loading === k ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null;

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <p className="font-display tracking-[0.3em] text-xs text-primary mb-2">CHOOSE YOUR ACCESS</p>
      <h2 className="font-display text-4xl md:text-5xl text-foreground mb-8">
        THREE WAYS IN
      </h2>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Entry */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-6 bg-card border border-border rounded-lg flex flex-col"
        >
          <FileText className="w-5 h-5 text-primary mb-3" aria-hidden="true" />
          <h3 className="font-display text-2xl text-foreground mb-1">{OFFERS.caseFiles.name}</h3>
          <p className="text-sm text-muted-foreground mb-4 flex-1">{OFFERS.caseFiles.blurb}</p>
          <span className="font-display text-3xl text-primary mb-4">{OFFERS.caseFiles.priceLabel}</span>
          <button
            onClick={() => go("case_files", [OFFERS.caseFiles.stripePriceId], true)}
            disabled={loading === "case_files"}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary/10 text-primary font-display text-xs tracking-widest rounded-sm hover:bg-primary/20 disabled:opacity-60"
          >
            {spin("case_files")} GET THE FILES
          </button>
        </motion.div>

        {/* Recurring */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.06 }}
          className="p-6 bg-primary/10 border border-primary rounded-lg flex flex-col shadow-[0_0_60px_-30px_hsl(var(--primary))]"
        >
          <Repeat className="w-5 h-5 text-primary mb-3" aria-hidden="true" />
          <h3 className="font-display text-2xl text-foreground mb-1">{OFFERS.membership.name}</h3>
          <p className="text-sm text-muted-foreground mb-4 flex-1">{OFFERS.membership.blurb}</p>
          <span className="font-display text-3xl text-primary mb-4">{OFFERS.membership.priceLabel}</span>
          <button
            onClick={() => go("membership", [OFFERS.membership.stripePriceId])}
            disabled={loading === "membership"}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-display text-xs tracking-widest rounded-sm hover:opacity-90 disabled:opacity-60"
          >
            {spin("membership")} START MEMBERSHIP
          </button>
        </motion.div>

        {/* Flagship */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.12 }}
          className="p-6 bg-card border border-primary/40 rounded-lg relative overflow-hidden flex flex-col"
        >
          <span className="absolute top-3 right-3 px-2 py-0.5 bg-primary text-primary-foreground font-display text-[9px] tracking-widest rounded-sm">
            FLAGSHIP
          </span>
          <Crown className="w-5 h-5 text-primary mb-3" aria-hidden="true" />
          <h3 className="font-display text-2xl text-foreground mb-1">{OFFERS.founders.name}</h3>
          <p className="text-sm text-muted-foreground mb-4 flex-1">{OFFERS.founders.blurb}</p>
          <span className="font-display text-3xl text-primary mb-4">{OFFERS.founders.priceLabel}</span>
          <button
            onClick={() => go("founders", [OFFERS.founders.stripePriceId])}
            disabled={loading === "founders"}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-display text-xs tracking-widest rounded-sm hover:opacity-90 disabled:opacity-60"
          >
            {spin("founders")} CLAIM THE ARCHIVE
          </button>
        </motion.div>
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
            ADD {OFFERS.bump.name.toUpperCase()} — {OFFERS.bump.priceLabel}
          </span>
          <br />
          {OFFERS.bump.blurb} Added to the Case Files checkout.
        </span>
      </label>
    </section>
  );
}
