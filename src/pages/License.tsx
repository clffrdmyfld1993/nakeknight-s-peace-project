import { motion } from "framer-motion";
import { Shirt, BookOpen, Gamepad2, Film, Bot, ArrowRight, CheckCircle2 } from "lucide-react";

const tiers = [
  {
    name: "MERCHANDISE",
    icon: Shirt,
    price: "$2,500 – $15,000",
    desc: "Apparel, accessories, collectibles, and physical goods featuring NakeKnight™ characters and branding.",
    includes: [
      "Character artwork usage rights",
      "Brand guidelines & asset kit",
      "Approved product categories",
      "Revenue share structure",
      "Marketing co-promotion",
    ],
    color: "from-primary/20 to-primary/5",
  },
  {
    name: "PUBLISHING",
    icon: BookOpen,
    price: "$5,000 – $30,000",
    desc: "Comics, graphic novels, prose fiction, and digital publications set in the NakeKnight™ universe.",
    includes: [
      "Full lore bible access",
      "Character & world IP rights",
      "Co-creation with AI tools",
      "Distribution support",
      "Cross-promotional campaigns",
    ],
    color: "from-blue-500/20 to-blue-500/5",
  },
  {
    name: "GAMING",
    icon: Gamepad2,
    price: "$10,000 – $75,000",
    desc: "Video games, mobile games, tabletop RPGs, and interactive experiences using NakeKnight™ IP.",
    includes: [
      "Complete IP licensing package",
      "Character models & design docs",
      "Story consultation (AI-assisted)",
      "Beta testing community access",
      "Joint launch marketing",
    ],
    color: "from-purple-500/20 to-purple-500/5",
  },
  {
    name: "FILM & MEDIA",
    icon: Film,
    price: "$25,000 – $200,000+",
    desc: "Animation, live-action, web series, podcasts, and streaming content based on NakeKnight™.",
    includes: [
      "Exclusive story adaptation rights",
      "Full creative consultation",
      "AI-generated pre-production assets",
      "Universe expansion rights",
      "Revenue participation model",
    ],
    color: "from-emerald-500/20 to-emerald-500/5",
  },
];

const CONTACT_EMAIL = "afterglow619@proton.me";

export default function License() {
  return (
    <div className="min-h-screen bg-background font-body pt-14">
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="flex items-center gap-2 mb-2">
            <p className="text-primary font-display tracking-[0.3em]">PARTNERSHIPS</p>
            <span className="inline-flex items-center gap-1 text-[10px] text-primary/60 bg-primary/5 border border-primary/10 rounded px-1.5 py-0.5">
              <Bot className="w-3 h-3" /> AI-Powered IP
            </span>
          </div>
          <h1 className="font-display text-6xl md:text-7xl text-foreground mb-4">NAKEKNIGHT™ LICENSING PORTAL</h1>
          <p className="text-muted-foreground max-w-xl">
            NakeKnight™ is an AI-native IP built for the future of entertainment.
            Partner with us to bring the Peacemaker to your medium.
          </p>
        </motion.div>

        {/* Tiers */}
        <h2 className="font-display text-3xl text-foreground mb-6">LICENSING TIERS</h2>
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary/30 transition-colors"
            >
              <div className={`p-6 bg-gradient-to-br ${tier.color}`}>
                <tier.icon className="w-8 h-8 text-foreground mb-3" />
                <h3 className="font-display text-3xl text-foreground">{tier.name}</h3>
                <p className="font-display text-xl text-primary mt-1">{tier.price}</p>
              </div>
              <div className="p-6">
                <p className="text-muted-foreground text-sm mb-5">{tier.desc}</p>
                <ul className="space-y-2 mb-6">
                  {tier.includes.map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm text-foreground/80">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <a
                  href={`mailto:${CONTACT_EMAIL}?subject=NakeKnight™ ${tier.name} License Inquiry&body=I'm interested in the ${tier.name} licensing tier for NakeKnight™. Please send me more details.`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary font-display text-sm tracking-wider rounded-sm hover:bg-primary/20 transition-colors"
                >
                  REQUEST LICENSE <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Why License Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="bg-card border border-border rounded-lg p-8 md:p-12"
        >
          <h2 className="font-display text-4xl text-foreground mb-6">WHY NAKEKNIGHT™?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-display text-xl text-primary mb-2">AI-NATIVE IP</h3>
              <p className="text-sm text-muted-foreground">
                Built from the ground up with AI — meaning infinite scalability in content production,
                rapid prototyping, and adaptation to any medium.
              </p>
            </div>
            <div>
              <h3 className="font-display text-xl text-primary mb-2">RICH UNIVERSE</h3>
              <p className="text-sm text-muted-foreground">
                10+ fully developed case files, a deep origin story, and a cast of complex characters
                ready for adaptation across any storytelling format.
              </p>
            </div>
            <div>
              <h3 className="font-display text-xl text-primary mb-2">PROVEN CONCEPT</h3>
              <p className="text-sm text-muted-foreground">
                The first AI-built entertainment brand with a complete business infrastructure —
                from digital sales to licensing to investor relations.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
