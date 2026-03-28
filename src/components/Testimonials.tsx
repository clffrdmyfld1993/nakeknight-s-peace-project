import { motion } from "framer-motion";
import { Quote } from "lucide-react";

interface Testimonial {
  quote: string;
  name: string;
  title: string;
  caseRef: string;
}

const testimonials: Testimonial[] = [
  {
    quote: "I came to that table ready to die. He made me want to live instead. Not with threats — with the truth I'd been too angry to see.",
    name: "Warlord Kael",
    title: "Former Leader, Red Ashes",
    caseRef: "NK-0041 — THE IRON PACT",
  },
  {
    quote: "Nine hours in a boardroom with a man who doesn't eat, doesn't sleep, and doesn't let you lie to yourself. I've never been more terrified — or more grateful.",
    name: "Miranda Chen",
    title: "CEO, Helix Dynamics",
    caseRef: "NK-0067 — THE NEON TRUCE",
  },
  {
    quote: "He named every one of our dead. All one hundred and twelve. A stranger remembered what we were too busy fighting to honor.",
    name: "Chief Raya",
    title: "Duskwalker Chieftain",
    caseRef: "NK-0089 — THE ASHEN ACCORD",
  },
  {
    quote: "I spent three years in that pit thinking I'd die there. He walked in like he owned the place, looked the boss in the eye, and ended it in sixty seconds.",
    name: "Talon",
    title: "Former Pit Fighter, Now Community Trainer",
    caseRef: "NK-0103 — PIT PEACE",
  },
  {
    quote: "He showed us satellite imagery of the cracks in real-time. Watched the blood drain from our faces. Then calmly asked if we wanted to save the city or drown with it.",
    name: "Admiral Hess",
    title: "Northern Fleet Commander",
    caseRef: "NK-0112 — THE DROWNED TREATY",
  },
  {
    quote: "We were three factions starving in the same building, pointing guns at each other over bread. He fed us first. Then he made us think. I've never seen anything like it.",
    name: "Foreman Dex Holt",
    title: "Ironside Workers Cooperative",
    caseRef: "NK-0128 — THE FORGE ACCORD",
  },
  {
    quote: "He asked me one question: how much fuel do we burn chasing caravans? I did the math. We were spending more on war than we could ever steal. Made me feel stupid — then he made me feel smart for seeing it.",
    name: '"Throttle" Jacobs',
    title: "Leader, The Razorbacks",
    caseRef: "NK-0134 — HIGHWAY KINGS",
  },
  {
    quote: "I told him he was asking me to trust my enemy. He said he was asking me to trust math. I've been a general for twenty years, and that's the first time someone out-strategized me with arithmetic.",
    name: "General Petra Vane",
    title: "Northern Guard Commander",
    caseRef: "NK-0147 — THE FROST LINE",
  },
  {
    quote: "He called me a pragmatist, not a monster. Nobody had done that in years. It didn't make me soft — it made me listen.",
    name: "Colonel Marsh",
    title: "Eastern District Sovereignty Zone",
    caseRef: "NK-0155 — MERCY WARD",
  },
  {
    quote: "Three days locked in a bunker with the five people I hated most. By the end, I realized I'd never actually talked to any of them. He didn't just broker peace — he introduced us to each other.",
    name: "Captain Orozco",
    title: "Southern Docks Coalition",
    caseRef: "NK-0168 — LAST HAVEN",
  },
];

export default function Testimonials() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <p className="text-primary font-display tracking-[0.3em] mb-3">VOICES</p>
        <h2 className="font-display text-5xl text-foreground mb-4">TESTIMONIALS</h2>
        <p className="text-muted-foreground mb-12 max-w-lg">
          In their own words — from warlords, generals, CEOs, and fighters who sat across the table from NakeKnight.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: (i % 4) * 0.08 }}
            className="p-6 bg-card border border-border rounded-lg hover:border-primary/30 transition-colors"
          >
            <Quote className="w-5 h-5 text-primary/40 mb-4" />
            <p className="text-foreground/90 text-sm leading-relaxed mb-5 italic">
              "{t.quote}"
            </p>
            <div className="border-t border-border pt-4">
              <p className="font-display text-lg text-foreground">{t.name}</p>
              <p className="text-xs text-muted-foreground mb-1">{t.title}</p>
              <p className="text-xs text-primary/60 font-mono">{t.caseRef}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
