import { motion } from "framer-motion";
import { Gamepad2, BookOpen, Boxes, Headphones, Glasses, Clapperboard } from "lucide-react";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";

const MILESTONES = [
  {
    icon: Headphones,
    phase: "SHIPPING NOW",
    title: "Weekly Audio Chronicles",
    body: "An autonomous engine writes, voices, and publishes a new NakeKnight episode every Friday — lore-checked and PG-gated before it goes live.",
    state: "live" as const,
  },
  {
    icon: BookOpen,
    phase: "NEXT",
    title: "Illustrated Case Files",
    body: "Season one collected as a printable dossier: episode scripts, lore bible entries, and the prompt architecture behind them.",
    state: "next" as const,
  },
  {
    icon: Boxes,
    phase: "EXPLORING",
    title: "Collectible Figures",
    body: "Armor-off knight figures with swappable tunics and peace-token accessories. Manufacturing partner not yet selected.",
    state: "explore" as const,
  },
  {
    icon: Clapperboard,
    phase: "EXPLORING",
    title: "Animated Short",
    body: "A single 6-minute pilot adapting the strongest episode arc of season one.",
    state: "explore" as const,
  },
  {
    icon: Gamepad2,
    phase: "EXPLORING",
    title: "Negotiation Game",
    body: "A small narrative game where every conflict is solved with empathy, wit, and creativity — never a weapon.",
    state: "explore" as const,
  },
  {
    icon: Glasses,
    phase: "LONG TERM",
    title: "Immersive Experience",
    body: "Spatial-audio walkthroughs of the Chronicles. Concept only — no timeline committed.",
    state: "later" as const,
  },
];

const badge: Record<string, string> = {
  live: "bg-primary/15 text-primary border-primary/40",
  next: "bg-accent/15 text-accent-foreground border-accent/40",
  explore: "bg-muted text-muted-foreground border-border",
  later: "bg-muted/50 text-muted-foreground border-border",
};

export default function Roadmap() {
  return (
    <div className="min-h-screen bg-background font-body pt-14">
      <SEO
        title="NakeKnight Roadmap — What Ships Next | HeroDossier"
        description="The honest build order for the NakeKnight universe: weekly audio chronicles shipping now, case files next, figures, animation and games under exploration."
        path="/roadmap"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "NakeKnight Universe Roadmap",
          itemListElement: MILESTONES.map((m, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: m.title,
            description: m.body,
          })),
        }}
      />

      <div className="max-w-5xl mx-auto px-6 py-16">
        <p className="font-display text-xs tracking-[0.3em] text-primary mb-3">ROADMAP</p>
        <h1 className="font-display text-4xl md:text-6xl text-foreground leading-tight mb-4">
          What actually ships next
        </h1>
        <p className="text-muted-foreground max-w-2xl leading-relaxed mb-12">
          No fake launch dates. Each item below is labelled with its real state — shipping, next in
          line, under exploration, or long term. It moves up the list when there is something to show.
        </p>

        <ol className="space-y-4">
          {MILESTONES.map((m, i) => (
            <motion.li
              key={m.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="p-6 bg-card/60 border border-border rounded-lg backdrop-blur-sm"
            >
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-background border border-border rounded-md shrink-0">
                  <m.icon className="w-5 h-5 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <span
                    className={`inline-block mb-2 px-2 py-0.5 border rounded-sm font-display text-[10px] tracking-[0.2em] ${badge[m.state]}`}
                  >
                    {m.phase}
                  </span>
                  <h2 className="font-display text-2xl text-foreground mb-1.5">{m.title}</h2>
                  <p className="text-muted-foreground leading-relaxed max-w-2xl">{m.body}</p>
                </div>
              </div>
            </motion.li>
          ))}
        </ol>

        <div className="mt-14 p-8 bg-card/60 border border-primary/30 rounded-lg">
          <h2 className="font-display text-2xl text-foreground mb-2">No list. No inbox.</h2>
          <p className="text-muted-foreground mb-5 max-w-xl">
            We don't collect emails. Milestones ship publicly here and in the weekly Chronicles drop
            — check back Fridays, or back the work now and get everything as it lands.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/store"
              className="font-display tracking-[0.2em] text-sm px-6 py-3 bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              BACK THE UNIVERSE
            </Link>
            <Link
              to="/chronicles"
              className="font-display tracking-[0.2em] text-sm px-6 py-3 border border-border text-foreground hover:border-primary transition-colors"
            >
              LISTEN FREE
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
