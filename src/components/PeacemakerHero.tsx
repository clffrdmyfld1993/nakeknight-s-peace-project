import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Headphones, ShieldCheck, Sparkles, Calendar, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PREMIUM_PRICE = "price_1TelQGQaKvygaDfuazPCyTBv";
const CASE_FILES_PRICE = "price_1TePGgQaKvygaDfu3DJTEJm4";

const getRef = () => {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("ref");
    return fromUrl || localStorage.getItem("nk_ref");
  } catch {
    return null;
  }
};

const buyPrice = async (price: string, source: string) => {
  const referral = getRef();
  const { data, error } = await supabase.functions.invoke("create-payment", {
    body: { items: [{ price, quantity: 1 }], referral, source },
  });
  if (error || !data?.url) {
    toast.error(error?.message || "Could not start checkout");
    return;
  }
  window.location.href = data.url;
};

const Countdown = ({ to }: { to: string }) => {
  const target = useMemo(() => new Date(to).getTime(), [to]);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);
  const diff = Math.max(0, target - now);
  const d = Math.floor(diff / 86_400_000);
  const h = Math.floor((diff % 86_400_000) / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);
  const cell = (n: number, l: string) => (
    <div className="flex flex-col items-center min-w-[48px]">
      <span className="font-display text-2xl md:text-3xl text-primary tabular-nums">
        {n.toString().padStart(2, "0")}
      </span>
      <span className="text-[9px] tracking-[0.2em] text-muted-foreground mt-0.5">{l}</span>
    </div>
  );
  return (
    <div className="flex items-center gap-3 md:gap-4">
      {cell(d, "DAYS")}<span className="text-primary/40">:</span>
      {cell(h, "HRS")}<span className="text-primary/40">:</span>
      {cell(m, "MIN")}<span className="text-primary/40">:</span>
      {cell(s, "SEC")}
    </div>
  );
};

export default function PeacemakerHero() {
  const [nextRelease, setNextRelease] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("weekly_serials")
        .select("release_date,is_published")
        .gt("release_date", new Date().toISOString())
        .order("release_date", { ascending: true })
        .limit(1);
      if (data && data[0]) setNextRelease(data[0].release_date);
    })();
  }, []);

  return (
    <section className="relative overflow-hidden bg-background pt-24 pb-16 md:pt-32 md:pb-24">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-primary/10 blur-[160px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent,hsl(var(--background))_70%)]" />
      </div>

      <div className="relative max-w-5xl mx-auto px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-primary/10 border border-primary/30 font-display text-[10px] tracking-[0.3em] text-primary mb-6"
        >
          <Sparkles className="w-3 h-3" /> SERIALIZED · WEEKLY · AI-BUILT
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="font-display text-5xl md:text-7xl lg:text-8xl text-foreground leading-[0.95] tracking-tight"
        >
          NAKEKNIGHT — <span className="text-primary">THE PEACEMAKER</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="mt-5 font-display text-base md:text-xl tracking-widest text-muted-foreground"
        >
          SERIALIZED AUDIO DRAMA FROM THE SHADOW WAR
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="mt-6 text-muted-foreground max-w-2xl mx-auto leading-relaxed"
        >
          An empathic mediator navigates a staged reality. Free episodes drop every week.
          Lifetime access to the full chronicles is a single payment — $29.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3 flex-wrap"
        >
          <Link
            to="/chronicles"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-display tracking-widest text-sm rounded-sm hover:opacity-90 shadow-[0_0_50px_-10px_hsl(var(--primary))]"
          >
            <Headphones className="w-4 h-4" /> LISTEN FREE — EP01
          </Link>
          <button
            onClick={() => buyPrice(PREMIUM_PRICE, "hero_premium")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-card border border-primary/40 text-foreground font-display tracking-widest text-sm rounded-sm hover:border-primary"
          >
            <Sparkles className="w-4 h-4 text-primary" /> UNLOCK CHRONICLES — $29
          </button>
          <button
            onClick={() => buyPrice(CASE_FILES_PRICE, "hero_case_files")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-card border border-border text-muted-foreground font-display tracking-widest text-sm rounded-sm hover:text-foreground hover:border-primary/40"
          >
            BUY CASE FILES — $15 <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
          className="mt-8 flex items-center justify-center gap-4 md:gap-6 text-[11px] tracking-[0.2em] text-muted-foreground font-display flex-wrap"
        >
          <span className="inline-flex items-center gap-1.5"><Calendar className="w-3 h-3 text-primary" /> NEW EPISODES WEEKLY</span>
          <span className="opacity-30">·</span>
          <span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-3 h-3 text-primary" /> 100% FOUNDER-OWNED</span>
          <span className="opacity-30">·</span>
          <span>BUILT FOR THE PEACE PROJECT</span>
        </motion.div>

        {nextRelease && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-10 inline-flex flex-col items-center px-6 py-4 bg-card/70 border border-primary/30 rounded-lg backdrop-blur-sm"
          >
            <p className="font-display text-[10px] tracking-[0.3em] text-primary mb-2">NEXT EPISODE DROPS IN</p>
            <Countdown to={nextRelease} />
          </motion.div>
        )}
      </div>
    </section>
  );
}
