import { motion } from "framer-motion";
import { Download, Sparkles, Bot, Shield, Zap } from "lucide-react";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";

const perks = [
  { icon: Bot, title: "AI Builder Blueprint", desc: "The exact stack, prompts, and workflow used to build NakeKnight end-to-end." },
  { icon: Shield, title: "Lore PDF", desc: "Origin, abilities, case files, and the visual codex — formatted for print." },
  { icon: Zap, title: "Early Drops", desc: "New comics, art packs, and tools go live to supporters before the public store." },
];

export default function Join() {
  return (
    <div className="min-h-screen bg-background font-body pt-14">
      <SEO
        title="Join — Free AI Builder Blueprint & NakeKnight Lore PDF"
        description="Get the free AI Builder Blueprint and the NakeKnight Lore PDF. The exact stack, prompts, and workflow behind a fully AI-built IP universe."
        path="/join"
      />

      <div className="max-w-4xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <p className="text-primary font-display tracking-[0.3em] mb-3">FREE DOWNLOAD</p>
          <h1 className="font-display text-5xl md:text-7xl text-foreground mb-6 leading-[0.9]">
            THE AI BUILDER<br />BLUEPRINT
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            The exact stack, prompts, and workflow used to build the NakeKnight™ universe — entirely by AI. Read it here, free, with no email required.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-16"
        >
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/chronicles"
              className="font-display tracking-[0.2em] text-sm px-6 py-3 bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              LISTEN FREE
            </Link>
            <Link
              to="/store"
              className="font-display tracking-[0.2em] text-sm px-6 py-3 border border-border text-foreground hover:border-primary transition-colors"
            >
              GET THE ARCHIVE
            </Link>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {perks.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 bg-card border border-border rounded-lg"
            >
              <p.icon className="w-6 h-6 text-primary mb-3" />
              <h3 className="font-display text-xl text-foreground mb-2">{p.title}</h3>
              <p className="text-sm text-muted-foreground">{p.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
          <Sparkles className="w-3 h-3 text-primary" />
          No spam. Unsubscribe anytime. We never sell your email.
        </div>
      </div>
    </div>
  );
}
