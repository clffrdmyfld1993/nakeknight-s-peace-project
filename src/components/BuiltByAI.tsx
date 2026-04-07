import { motion } from "framer-motion";
import { Bot, Sparkles, Code2, Palette, FileText, TrendingUp, Globe, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const steps = [
  { icon: Sparkles, label: "Idea", desc: "One concept: a hero who fights with fairness, not fists.", tool: "Human Creativity" },
  { icon: Palette, label: "Character Design", desc: "Full character art, hero portrait, and visual identity.", tool: "Midjourney + DALL·E" },
  { icon: FileText, label: "World Building", desc: "10 case files, origin story, testimonials, deep lore.", tool: "Claude + GPT-4" },
  { icon: Code2, label: "Website", desc: "This entire site — every page, animation, and interaction.", tool: "Lovable" },
  { icon: TrendingUp, label: "Business Strategy", desc: "Revenue streams, licensing tiers, investor pitch.", tool: "Claude" },
  { icon: Globe, label: "Launch", desc: "Digital store, licensing portal, and investor deck — live.", tool: "All AI" },
];

export default function BuiltByAI() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="flex items-center gap-2 mb-3">
          <p className="text-primary font-display tracking-[0.3em]">THE EXPERIMENT</p>
          <span className="inline-flex items-center gap-1 text-[10px] text-primary/60 bg-primary/5 border border-primary/10 rounded px-1.5 py-0.5">
            <Bot className="w-3 h-3" /> 100% AI-Built
          </span>
        </div>
        <h2 className="font-display text-5xl text-foreground mb-4">BUILT BY AI</h2>
        <p className="text-muted-foreground mb-12 max-w-lg">
          This entire business — from character design to investor pitch — was created using
          nothing but artificial intelligence. Here's exactly how.
        </p>
      </motion.div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-px" />

        {steps.map((step, i) => (
          <motion.div
            key={step.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={`relative flex items-start gap-6 mb-8 ${
              i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
            }`}
          >
            {/* Dot */}
            <div className="absolute left-4 md:left-1/2 w-3 h-3 bg-primary rounded-full -translate-x-1.5 mt-2 z-10" />

            {/* Content */}
            <div className={`ml-12 md:ml-0 md:w-1/2 ${i % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"}`}>
              <div className={`inline-flex items-center gap-2 mb-1 ${i % 2 === 0 ? "md:flex-row-reverse" : ""}`}>
                <step.icon className="w-5 h-5 text-primary" />
                <span className="font-display text-xl text-foreground">{step.label}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-1">{step.desc}</p>
              <span className="text-[10px] text-primary/60 font-mono">{step.tool}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-12 text-center"
      >
        <p className="text-foreground font-display text-2xl mb-2">YOU CAN DO THIS TOO.</p>
        <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
          If one person with AI can build a complete entertainment brand in 48 hours,
          imagine what you could create.
        </p>
        <Link
          to="/pitch"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-display text-lg tracking-wider rounded-sm hover:bg-primary/90 transition-colors"
        >
          SEE THE PITCH <ArrowRight className="w-5 h-5" />
        </Link>
      </motion.div>
    </section>
  );
}
