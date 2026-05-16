import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Bot, TrendingUp, Target, Users, Lightbulb, DollarSign, Rocket, Shield } from "lucide-react";

// HARDCODED FACTS — no projected or simulated figures.
const catalogFacts = [
  { label: "Digital SKUs live on Stripe", value: "6" },
  { label: "Entry price", value: "$2.99" },
  { label: "Top price", value: "$14.99" },
];

const useOfFunds = [
  { category: "Content Production", pct: 35, color: "bg-primary" },
  { category: "Marketing & Community", pct: 25, color: "bg-blue-500" },
  { category: "Technology & AI Tools", pct: 20, color: "bg-purple-500" },
  { category: "Legal & IP Protection", pct: 10, color: "bg-emerald-500" },
  { category: "Operations", pct: 10, color: "bg-amber-500" },
];

const traction = [
  { metric: "Digital Products Live", value: "6" },
  { metric: "Licensing Tiers Defined", value: "4" },
  { metric: "Public Site Routes", value: "8" },
  { metric: "Payment Provider", value: "Stripe" },
  { metric: "Backend", value: "Lovable Cloud" },
  { metric: "Outside Capital Raised", value: "$0" },
];

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
      className={`py-20 ${className}`}
    >
      {children}
    </motion.section>
  );
}

export default function Pitch() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div ref={containerRef} className="min-h-screen bg-background font-body pt-14">
      {/* Progress bar */}
      <motion.div
        className="fixed top-14 left-0 h-0.5 bg-primary z-40"
        style={{ width: progressWidth }}
      />

      <div className="max-w-4xl mx-auto px-6">
        {/* Title */}
        <Section>
          <div className="flex items-center gap-2 mb-3">
            <p className="text-primary font-display tracking-[0.3em]">SEED ROUND</p>
            <span className="inline-flex items-center gap-1 text-[10px] text-primary/60 bg-primary/5 border border-primary/10 rounded px-1.5 py-0.5">
              <Bot className="w-3 h-3" /> Built Entirely By AI
            </span>
          </div>
          <h1 className="font-display text-7xl md:text-8xl text-foreground leading-[0.85] mb-6">
            INVEST IN<br />THE FUTURE<br />OF IP
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl">
            NakeKnight™ is the world's first AI-native entertainment brand — proving that
            a single idea, powered entirely by artificial intelligence, can become a profitable business.
          </p>
        </Section>

        {/* Problem */}
        <Section>
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-primary" />
            <h2 className="font-display text-4xl text-foreground">THE PROBLEM</h2>
          </div>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Creating an entertainment IP traditionally requires <span className="text-foreground">millions in capital</span>,
              large creative teams, years of development, and established industry connections.
            </p>
            <p>
              <span className="text-foreground">99% of creators with great ideas</span> never get past the concept stage
              because the barriers to entry are impossibly high.
            </p>
          </div>
        </Section>

        {/* Solution */}
        <Section>
          <div className="flex items-center gap-3 mb-4">
            <Lightbulb className="w-6 h-6 text-primary" />
            <h2 className="font-display text-4xl text-foreground">THE SOLUTION</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed mb-6">
            NakeKnight™ proves that AI can replace entire departments — from character design and
            world-building to website development and business strategy — creating a
            <span className="text-primary"> fully operational entertainment brand from a single idea</span>.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {["Character Design", "Story Writing", "Art Generation", "Web Development", "Business Strategy", "Marketing Copy", "Legal Docs", "Investor Materials"].map(item => (
              <div key={item} className="p-3 bg-card border border-border rounded text-center">
                <span className="text-sm text-foreground">{item}</span>
                <div className="text-[10px] text-primary/50 mt-1">AI-Powered</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Catalog snapshot — verifiable facts only */}
        <Section>
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-primary" />
            <h2 className="font-display text-4xl text-foreground">CATALOG SNAPSHOT</h2>
          </div>
          <p className="text-muted-foreground mb-6 max-w-xl">
            Hardcoded facts from the live Stripe catalog. No projections, no
            simulated market sizes.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {catalogFacts.map(s => (
              <div key={s.label} className="p-6 bg-card border border-border rounded-lg text-center">
                <div className="font-display text-5xl text-primary mb-1">{s.value}</div>
                <div className="text-sm text-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Traction */}
        <Section>
          <div className="flex items-center gap-3 mb-6">
            <Rocket className="w-6 h-6 text-primary" />
            <h2 className="font-display text-4xl text-foreground">TRACTION</h2>
          </div>
          <p className="text-muted-foreground mb-8">
            Built in under 48 hours with <span className="text-foreground">$0 invested</span> — using only AI tools.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {traction.map(t => (
              <div key={t.metric} className="p-5 bg-card border border-border rounded-lg">
                <div className="font-display text-4xl text-primary mb-1">{t.value}</div>
                <div className="text-sm text-muted-foreground">{t.metric}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Use of Funds */}
        <Section>
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-6 h-6 text-primary" />
            <h2 className="font-display text-4xl text-foreground">USE OF FUNDS</h2>
          </div>
          <p className="text-muted-foreground mb-8">Seeking <span className="text-primary font-display text-xl">$50,000</span> seed round</p>
          <div className="space-y-4">
            {useOfFunds.map((f, i) => (
              <motion.div
                key={f.category}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-foreground">{f.category}</span>
                  <span className="text-primary font-display">{f.pct}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${f.color} rounded-full`}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${f.pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* Team */}
        <Section>
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-6 h-6 text-primary" />
            <h2 className="font-display text-4xl text-foreground">THE TEAM</h2>
          </div>
          <div className="bg-card border border-border rounded-lg p-8">
            <h3 className="font-display text-2xl text-foreground mb-2">THE CREATOR + AI</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              One visionary creator armed with the most powerful AI tools available.
              This isn't a limitation — it's the thesis. If one person with AI can build
              what traditionally takes a team of 50, imagine what happens when we scale.
            </p>
            <div className="flex flex-wrap gap-2">
              {["Lovable", "Claude", "GPT-4", "Midjourney", "DALL·E", "Remotion", "Medusa"].map(tool => (
                <span key={tool} className="px-3 py-1 bg-primary/10 text-primary text-xs font-display tracking-wider rounded-sm">
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </Section>

        {/* The Ask */}
        <Section>
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-primary" />
            <h2 className="font-display text-4xl text-foreground">THE ASK</h2>
          </div>
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-8 md:p-12 text-center">
            <div className="font-display text-7xl text-primary mb-2">$50,000</div>
            <p className="font-display text-2xl text-foreground mb-4">SEED ROUND</p>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Join us in proving that the future of entertainment is AI-native.
              Every dollar invested accelerates the transformation from concept to empire.
            </p>
            <a
              href="mailto:afterglow619@proton.me?subject=NakeKnight™ Seed Investment Inquiry&body=I'm interested in learning more about the NakeKnight™ seed round opportunity."
              className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground font-display text-lg tracking-wider rounded-sm hover:bg-primary/90 transition-colors"
            >
              CONTACT US
            </a>
          </div>
        </Section>

        {/* Footer note */}
        <div className="py-12 text-center">
          <p className="text-xs text-muted-foreground/50">
            This pitch deck was built entirely by AI using Lovable. NakeKnight™ is a fictional IP created for entertainment purposes.
          </p>
        </div>
      </div>
    </div>
  );
}
