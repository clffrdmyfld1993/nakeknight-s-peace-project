import { motion } from "framer-motion";
import SEO from "@/components/SEO";
import { Bot, Sparkles } from "lucide-react";

import cyberpunkImg from "@/assets/costumes/cyberpunk-mercenary.jpg";
import paladinImg from "@/assets/costumes/fantasy-paladin.jpg";
import pharaonicImg from "@/assets/costumes/pharaonic-guard.jpg";
import gladiatorImg from "@/assets/costumes/gladiator.jpg";
import ninjaImg from "@/assets/costumes/urban-ninja.jpg";
import tuxedoImg from "@/assets/costumes/formal-tuxedo.jpg";

const costumes = [
  { id: "cyberpunk", name: "Cyberpunk Mercenary", image: cyberpunkImg, era: "Future", desc: "Neon-laced tactical armor for the digital battlefield." },
  { id: "paladin", name: "High Fantasy Paladin", image: paladinImg, era: "Medieval", desc: "Holy knight armor forged in the halls of justice." },
  { id: "pharaonic", name: "Pharaonic Guard", image: pharaonicImg, era: "Ancient Egypt", desc: "Golden regalia of the desert protector." },
  { id: "gladiator", name: "Gladiator", image: gladiatorImg, era: "Roman Empire", desc: "Arena champion, wielding trident and honor." },
  { id: "ninja", name: "Urban Ninja", image: ninjaImg, era: "Modern", desc: "Silent operative in the concrete jungle." },
  { id: "tuxedo", name: "Formal Tuxedo", image: tuxedoImg, era: "Contemporary", desc: "Diplomacy requires the sharpest armor of all." },
];

export default function Costumes() {
  return (
    <div className="min-h-screen bg-background font-body pt-14">
      <SEO
        title="NakeKnight™ Costume Vault — Multiverse Variants"
        description="Explore NakeKnight across eras: cyberpunk mercenary, fantasy paladin, pharaonic guard, gladiator, urban ninja, and formal tuxedo."
        path="/costumes"
      />
      <div className="max-w-6xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-primary font-display tracking-[0.3em]">MULTIVERSE</p>
            <span className="inline-flex items-center gap-1 text-[10px] text-primary/60 bg-primary/5 border border-primary/10 rounded px-1.5 py-0.5">
              <Sparkles className="w-3 h-3" /> AI-Generated
            </span>
          </div>
          <h1 className="font-display text-6xl md:text-7xl text-foreground mb-4">NAKEKNIGHT™ COSTUME VAULT</h1>
          <p className="text-muted-foreground max-w-xl">
            NakeKnight™ across dimensions. Every era, every style — all AI-designed costume variants for licensing, merch, and storytelling.
          </p>
        </motion.div>

        <h2 className="font-display text-3xl text-foreground mb-6">COSTUME GALLERY</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {costumes.map((costume, i) => (
            <motion.div
              key={costume.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-lg overflow-hidden group hover:border-primary/30 transition-colors"
            >
              <div className="relative h-80 overflow-hidden">
                <img
                  src={costume.image}
                  alt={costume.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="text-[10px] text-primary font-display tracking-widest">{costume.era.toUpperCase()}</span>
                  <h3 className="font-display text-2xl text-foreground">{costume.name.toUpperCase()}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{costume.desc}</p>
                </div>
              </div>
              <div className="px-4 py-3 flex items-center gap-1 text-[10px] text-primary/50 border-t border-border">
                <Bot className="w-3 h-3" /> AI-Generated Concept • Licensable Design
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-foreground font-display text-2xl mb-2">EVERY COSTUME IS LICENSABLE.</p>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
            Merch partners, game studios, and cosplayers — each design is available for commercial licensing.
          </p>
          <a
            href="/license"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-display text-lg tracking-wider rounded-sm hover:bg-primary/90 transition-colors"
          >
            EXPLORE LICENSING
          </a>
        </motion.div>
      </div>
    </div>
  );
}
