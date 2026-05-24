import { motion } from "framer-motion";
import { Shield, Users, Scale, Heart } from "lucide-react";
import heroImage from "@/assets/nakeknight-hero.png";
import CaseFiles from "./CaseFiles";
import Testimonials from "./Testimonials";
import BuiltByAI from "./BuiltByAI";
import SEO from "./SEO";

const stats = [
  { label: "Disputes Resolved", value: "2,847", icon: Scale },
  { label: "Lives Changed", value: "14K+", icon: Heart },
  { label: "Communities Served", value: "312", icon: Users },
  { label: "Success Rate", value: "99.7%", icon: Shield },
];

const abilities = [
  { name: "Empathic Resonance", desc: "Feels the emotions of all parties, understanding their deepest grievances." },
  { name: "Voice of Reason", desc: "His words carry an unnatural weight — even the most stubborn listen." },
  { name: "Binding Accord", desc: "Once a deal is struck in his presence, both parties feel compelled to honor it." },
  { name: "Aura of Calm", desc: "Hostility dissolves within his radius. Weapons lower. Fists unclench." },
];

export default function HeroProfile() {
  return (
    <div className="min-h-screen bg-background font-body pt-14">
      <SEO
        title="NakeKnight™ — The Peacemaker"
        description="NakeKnight resolves conflict through empathy, fairness, and AI-built storytelling. Explore case files, abilities, and the origin of the Peacemaker."
        path="/"
        preloadImage={heroImage}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] animate-pulse-glow" />

        <div className="relative max-w-6xl mx-auto px-6 pt-8 pb-16">
          {/* Nav */}
          {/* Nav handled by SiteNav */}

          {/* Hero content */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <p className="text-primary font-display text-lg tracking-[0.3em] mb-2">THE PEACEMAKER</p>
              <h1 className="font-display text-7xl md:text-8xl lg:text-9xl text-foreground leading-[0.85] mb-6">
                <span className="block">NAKE<br />KNIGHT</span>
                <span className="sr-only">NakeKnight — The Peacemaker</span>
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-md mb-8">
                In a world torn by conflict, one man stands between chaos and resolution.
                He doesn't fight with fists — he fights with <span className="text-primary font-medium">fairness</span>.
              </p>
              <div className="flex gap-3">
                <a
                  href="#case-files"
                  className="px-5 py-2.5 bg-primary text-primary-foreground font-display text-lg tracking-wider rounded-sm hover:bg-primary/90 transition-colors"
                >
                  VIEW CASE FILES
                </a>
                <a
                  href="mailto:afterglow619@proton.me"
                  className="px-5 py-2.5 border border-border text-foreground font-display text-lg tracking-wider rounded-sm hover:border-primary/40 transition-colors"
                >
                  CONTACT
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="relative w-full max-w-md mx-auto aspect-square">
                <div className="absolute -inset-4 bg-gradient-to-t from-primary/20 via-transparent to-transparent rounded-2xl blur-xl" />
                <img
                  src={heroImage}
                  alt="NakeKnight - The Peacemaker"
                  width={512}
                  height={512}
                  fetchPriority="high"
                  decoding="async"
                  className="relative w-full h-full object-cover rounded-lg shadow-2xl"
                />
              </div>

            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card/50">
        <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
              <div className="font-display text-4xl text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Origin Story */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-2xl"
        >
          <p className="text-primary font-display tracking-[0.3em] mb-3">ORIGIN</p>
          <h2 className="font-display text-5xl text-foreground mb-6">FORGED IN CONFLICT</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Once a soldier who witnessed the futility of war firsthand, NakeKnight abandoned
              the battlefield when he realized that victory without understanding breeds only
              deeper resentment.
            </p>
            <p>
              He emerged from the ashes — not as a destroyer, but as a <span className="text-foreground">bridge between enemies</span>.
              His armor is a reminder of the violence he left behind. His words are the only weapon he needs.
            </p>
            <p>
              Today, he walks into boardrooms and battlefields alike, armed with nothing but an unshakable
              commitment to ensuring <span className="text-primary">every party walks away satisfied</span>.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Abilities */}
      <section className="bg-card/30 border-y border-border">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <p className="text-primary font-display tracking-[0.3em] mb-3">POWERS</p>
          <h2 className="font-display text-5xl text-foreground mb-12">ABILITIES</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {abilities.map((ability, i) => (
              <motion.div
                key={ability.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 bg-card border border-border rounded-lg hover:border-primary/40 transition-colors"
              >
                <h3 className="font-display text-2xl text-foreground mb-2">{ability.name}</h3>
                <p className="text-muted-foreground">{ability.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Files */}
      <CaseFiles />

      {/* Testimonials */}
      <Testimonials />

      {/* Built By AI */}
      <BuiltByAI />

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 py-12 flex items-center justify-between">
        <span className="font-display text-xl text-primary tracking-wider">NAKEKNIGHT™</span>
        <span className="text-xs text-muted-foreground">© {new Date().getFullYear()} NakeKnight™. All rights reserved. All characters and narratives are fictional.</span>
      </footer>
    </div>
  );
}
