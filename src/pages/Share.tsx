import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Sparkles } from "lucide-react";
import SEO from "@/components/SEO";
import { toast } from "sonner";

const SITE = "https://herodossier.lovable.app";

const assets = [
  {
    title: "X Thread Opener",
    body:
      "🎙️ NAKEKNIGHT — THE PEACEMAKER\n\nA serialized audio drama from the shadow war. An empathic mediator. A staged reality.\n\nFree episodes weekly. Lifetime access $29.\n\nListen → " +
      SITE +
      "/chronicles",
  },
  {
    title: "Reddit Post",
    body:
      "Title: I built an entire serialized audio drama with AI — free weekly episodes\n\n" +
      "Body: It's called NAKEKNIGHT — The Peacemaker. Scripts, voices, score — all AI-built. " +
      "New chapter every week. The first episodes are free, lifetime access is $29.\n\n" +
      "Link: " +
      SITE +
      "/chronicles",
  },
  {
    title: "Instagram / TikTok Caption",
    body:
      "He doesn't fight. He mediates.\nNAKEKNIGHT — The Peacemaker.\nWeekly audio drops. Free to start.\n\n🔗 " +
      SITE +
      "/chronicles\n#audiodrama #ai #nakeknight",
  },
  {
    title: "WhatsApp Forward",
    body:
      "Found a really cool new audio drama — built entirely with AI. New episode every week, free to start. " +
      SITE +
      "/chronicles",
  },
  {
    title: "Email Signature",
    body:
      "P.S. I'm following NAKEKNIGHT — a weekly serialized audio drama: " + SITE + "/chronicles",
  },
];

export default function Share() {
  const [ref, setRef] = useState("");
  const buildRef = (url: string) =>
    ref.trim() ? `${url}${url.includes("?") ? "&" : "?"}ref=${encodeURIComponent(ref.trim())}` : url;

  const copy = async (text: string) => {
    const final = ref.trim()
      ? text.split(`${SITE}/chronicles`).join(buildRef(`${SITE}/chronicles`))
      : text;
    try {
      await navigator.clipboard.writeText(final);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <div className="min-h-screen bg-background font-body pt-14">
      <SEO
        title="Share NakeKnight — Promo Kit & Referral Links"
        description="Ready-made promo copy and referral links for sharing NakeKnight's Peace Project across X, Reddit, Instagram, TikTok, and WhatsApp."
        path="/share"
      />
      <div className="max-w-3xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-primary font-display tracking-[0.3em] text-xs mb-2">PROMO KIT</p>
          <h1 className="font-display text-5xl md:text-6xl text-foreground mb-4">SHARE THE SAGA</h1>
          <p className="text-muted-foreground max-w-xl mb-10">
            Copy-paste promo for X, Reddit, Instagram, TikTok, and WhatsApp. Add a referral tag and
            we'll track which posts convert.
          </p>
        </motion.div>

        <div className="mb-10 p-5 bg-card/60 border border-primary/30 rounded-lg">
          <label className="font-display text-[11px] tracking-widest text-muted-foreground">
            REFERRAL CODE (OPTIONAL)
          </label>
          <input
            value={ref}
            onChange={(e) => setRef(e.target.value.slice(0, 60))}
            placeholder="your-handle"
            className="mt-1 w-full px-3 py-2 bg-background border border-border rounded-sm text-sm focus:outline-none focus:border-primary"
          />
          <p className="text-[11px] text-muted-foreground mt-2">
            Adds <code className="text-primary">?ref={ref || "your-handle"}</code> to chronicles links so we can attribute traffic & sales.
          </p>
        </div>

        <div className="space-y-4">
          {assets.map((a) => (
            <div key={a.title} className="p-5 bg-card border border-border rounded-lg">
              <div className="flex items-center justify-between gap-3 mb-3">
                <p className="font-display tracking-widest text-sm text-foreground">
                  {a.title.toUpperCase()}
                </p>
                <button
                  onClick={() => copy(a.body)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground font-display text-xs tracking-widest rounded-sm hover:opacity-90"
                >
                  <Copy className="w-3.5 h-3.5" /> COPY
                </button>
              </div>
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">
                {a.body}
              </pre>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-primary/10 border border-primary/30 rounded-lg text-center">
          <Sparkles className="w-5 h-5 text-primary mx-auto mb-2" />
          <p className="font-display tracking-widest text-sm text-primary mb-1">REFERRAL BONUS</p>
          <p className="text-sm text-muted-foreground">
            Share your receipt + referral link with us and we'll send you bonus lore content.
          </p>
        </div>
      </div>
    </div>
  );
}
