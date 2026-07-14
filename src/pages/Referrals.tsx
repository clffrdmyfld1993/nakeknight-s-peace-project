import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Copy, Sparkles } from "lucide-react";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getStoredRef } from "@/components/RefCapture";

const SITE = "https://herodossier.lovable.app";

interface Row {
  referral_code: string;
  referrals: number;
}

// Anonymize a referral code for public display
const mask = (code: string) => {
  if (code.length <= 4) return code[0] + "***";
  return code.slice(0, 2) + "***" + code.slice(-2);
};

export default function Referrals() {
  const [rows, setRows] = useState<Row[]>([]);
  const [ref, setRef] = useState("");

  useEffect(() => {
    setRef(getStoredRef() ?? "");
    (async () => {
      const { data } = await supabase.rpc("get_referral_counts");
      if (Array.isArray(data)) setRows(data as Row[]);
    })();
  }, []);

  const link = ref.trim()
    ? `${SITE}/chronicles?ref=${encodeURIComponent(ref.trim())}`
    : `${SITE}/chronicles`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Referral link copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <div className="min-h-screen bg-background font-body pt-14">
      <SEO
        title="Referrals — Share NakeKnight, Earn Rewards"
        description="Join the NakeKnight referral program. Share your link, help grow the Peace Project, and earn credits toward premium content and future IP drops."
        path="/referrals"
      />
      <div className="max-w-3xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-primary font-display tracking-[0.3em] text-xs mb-2">GROWTH LOOP</p>
          <h1 className="font-display text-5xl md:text-6xl text-foreground mb-4">REFERRAL PROGRAM</h1>
          <p className="text-muted-foreground max-w-xl mb-10">
            Every link you share gets a <code className="text-primary">?ref=</code> tag. When people sign up or buy, we
            attribute it to you. Top referrers unlock bonus lore, early episodes, and priority access to future physical
            drops.
          </p>
        </motion.div>

        <div className="p-6 bg-card/70 border border-primary/30 rounded-lg mb-10">
          <label className="font-display text-[11px] tracking-widest text-muted-foreground">YOUR REFERRAL CODE</label>
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <input
              value={ref}
              onChange={(e) => {
                const v = e.target.value.slice(0, 60);
                setRef(v);
                try {
                  if (v.trim()) localStorage.setItem("nk_ref", v.trim());
                } catch {
                  // ignore
                }
              }}
              placeholder="your-handle"
              className="flex-1 px-3 py-2 bg-background border border-border rounded-sm text-sm focus:outline-none focus:border-primary"
            />
            <button
              onClick={copy}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-display tracking-widest text-sm rounded-sm hover:opacity-90"
            >
              <Copy className="w-4 h-4" /> COPY LINK
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2 break-all">{link}</p>
        </div>

        <div className="p-6 bg-card/60 border border-border rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-4 h-4 text-primary" />
            <p className="font-display tracking-widest text-sm text-foreground">TOP REFERRERS</p>
          </div>
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">Leaderboard fills as referral traffic starts flowing.</p>
          ) : (
            <ol className="space-y-2">
              {rows.map((r, i) => (
                <li
                  key={r.referral_code}
                  className="flex items-center justify-between px-3 py-2 bg-background/60 border border-border rounded-sm text-sm"
                >
                  <span className="font-display tracking-widest text-muted-foreground">
                    #{String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-mono text-foreground">{mask(r.referral_code)}</span>
                  <span className="text-primary font-display">{r.referrals}</span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="mt-10 p-6 bg-primary/10 border border-primary/30 rounded-lg text-center">
          <Sparkles className="w-5 h-5 text-primary mx-auto mb-2" />
          <p className="font-display tracking-widest text-sm text-primary mb-1">FIRST 50 REFERRERS</p>
          <p className="text-sm text-muted-foreground">
            Get an exclusive lore packet + shout-out in an upcoming episode. Keep sharing.
          </p>
        </div>
      </div>
    </div>
  );
}
