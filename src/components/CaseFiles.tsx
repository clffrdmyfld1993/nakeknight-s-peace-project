import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, X, Play } from "lucide-react";
import caseIronPact from "@/assets/case-iron-pact.jpg";
import caseNeonTruce from "@/assets/case-neon-truce.jpg";
import caseAshenAccord from "@/assets/case-ashen-accord.jpg";
import casePitPeace from "@/assets/case-pit-peace.jpg";

interface CaseFile {
  id: string;
  codename: string;
  title: string;
  date: string;
  status: string;
  threat: string;
  image: string;
  summary: string;
  narrative: string;
  resolution: string;
  hasVideo?: boolean;
  videoUrl?: string;
}

const caseFiles: CaseFile[] = [
  {
    id: "NK-0041",
    codename: "THE IRON PACT",
    title: "Siege of Redmarsh",
    date: "2024.11.03",
    status: "RESOLVED",
    threat: "CRITICAL",
    image: caseIronPact,
    summary: "Two warlord factions locked in a blood feud over a freshwater source. 3,000 lives at stake.",
    narrative: `The ruins of Redmarsh still smoked when NakeKnight arrived. Commander Voss of the Iron Wolves had held the eastern reservoir for six months. Warlord Kael's Red Ashes had been dying of thirst since summer.

Both sides had weapons trained on each other across the shattered town square. NakeKnight walked into the crossfire barefoot.

"You're both dying," he said, his voice carrying that unnatural weight. "Voss — your wells are poisoned with runoff from the chemical plant you're guarding. Kael — you have the only water purification tech left in the region, rusting in a warehouse because you think it's worthless."

The silence was deafening. He'd done his homework.

He proposed the Redmarsh Compact: shared access to the reservoir, with Kael's engineers purifying the water and Voss's soldiers providing defense. Neither side got everything. Both sides got to live.

Commander Voss's hand shook as she signed. Warlord Kael spat on the ground — then shook NakeKnight's hand. "You fight dirty," Kael growled. "With facts," NakeKnight replied.`,
    resolution: "The Redmarsh Compact has held for 14 months. Population has grown from 800 to 2,400. Both factions now operate a joint council.",
  },
  {
    id: "NK-0067",
    codename: "THE NEON TRUCE",
    title: "Corporate War: Helix vs. Obsidian",
    date: "2025.01.18",
    status: "RESOLVED",
    threat: "SEVERE",
    image: caseNeonTruce,
    summary: "Two megacorps on the brink of deploying private armies over territorial AI licensing rights.",
    narrative: `Helix Dynamics and Obsidian Group controlled 80% of the remaining autonomous defense systems. When Helix discovered Obsidian had been secretly licensing their AI cores to black market weapons dealers, they didn't call lawyers. They mobilized a strike team.

NakeKnight intercepted the convoy twelve miles out. He didn't stop them by force. He showed them the data.

"Obsidian isn't your enemy," he told Helix CEO Miranda Chen through a cracked holographic display. "They've been selling to the same dealers who've been sabotaging YOUR supply chains. You're both being played by a third party."

He spent nine hours in that boardroom. No breaks. No food. Just relentless, surgical negotiation. He forced both sides to open their encrypted ledgers — and there it was. A shadow broker called The Architect had been playing them against each other for years.

By dawn, the two CEOs had signed a mutual defense pact and a joint investigation order. The private armies stood down.

"You should have been a lawyer," Chen told him. NakeKnight looked at the soldiers outside. "Lawyers don't walk into kill zones."`,
    resolution: "Joint investigation uncovered The Architect's network. Both companies now share threat intelligence. Zero casualties.",
  },
  {
    id: "NK-0089",
    codename: "THE ASHEN ACCORD",
    title: "The Desert Tribes Unification",
    date: "2025.06.22",
    status: "RESOLVED",
    threat: "EXTREME",
    image: caseAshenAccord,
    summary: "Five nomadic tribes at war over a sacred oasis. Generations of blood debt. 12,000 displaced.",
    narrative: `This was the one they said was impossible. Five tribes. Five blood debts stretching back decades. The Oasis of Shal'mar — the last green water source in the Ashlands — had been fought over so many times the sand around it was more red than gold.

NakeKnight spent three weeks living with each tribe before calling the summit. He learned their songs. Their burial rites. The names of every warrior they'd lost.

When the five chieftains met at the bonfire, tensions nearly erupted immediately. Chief Raya of the Duskwalkers drew a blade. Chief Maro of the Stonehands reached for his war hammer.

NakeKnight stood between them and spoke — not of politics or resources, but of the dead. He named every fallen warrior from every tribe. One hundred and twelve names, spoken from memory, each one a life lost to this feud.

The chieftains wept. Not all of them — but enough.

The Ashen Accord divided the oasis into five sectors with rotating stewardship. Each tribe would guard the water for one season, then pass the duty to the next. The dead would be honored with a shared memorial at the oasis center.

"You memorized our dead," Chief Raya whispered. "They deserved to be remembered by someone who wasn't trying to avenge them," NakeKnight answered.`,
    resolution: "The Ashen Accord holds. The five tribes now hold an annual gathering at Shal'mar. The memorial wall carries 112 names.",
  },
  {
    id: "NK-0103",
    codename: "PIT PEACE",
    title: "The Underground Circuit Shutdown",
    date: "2025.09.11",
    status: "RESOLVED",
    threat: "HIGH",
    image: casePitPeace,
    summary: "An illegal gladiator ring using indebted fighters. Two champions forced to fight to the death.",
    narrative: `The Pit was the worst-kept secret in Sector 7. Underground fights, rigged bets, fighters trapped by debt they could never repay. The final match of the season: Talon vs. Reaver. Two men who'd been friends before the debts consumed them. Fight to the death. Winner goes free. Loser's family pays double.

NakeKnight didn't come to negotiate with the fighters. He came for the house.

He walked into the arena owner's private box during the match and laid out a tablet showing every financial transaction, every rigged fight, every bribed official. "You have two options," he told pit boss Sera Vox. "I release this data in sixty seconds, and you lose everything. Or you shut it down tonight and I give you exactly one chance to walk away."

Sera laughed. Then she saw the countdown on the tablet.

NakeKnight turned to the arena. Both fighters were circling each other, blades drawn, the crowd roaring. He walked between them — into the spotlight — and raised both hands.

"This fight is over," he announced. The crowd screamed. But Talon and Reaver looked at each other, then at NakeKnight, and lowered their weapons.

Sera Vox killed the lights. By morning, the Pit was empty. Every fighter's debt was erased — not out of mercy, but because the records mysteriously corrupted that night. NakeKnight never confirmed his involvement.`,
    resolution: "47 fighters freed. Sera Vox disappeared. The Pit remains closed. Talon and Reaver now run a community defense training program.",
  },
];

export default function CaseFiles() {
  const [selectedCase, setSelectedCase] = useState<CaseFile | null>(null);

  return (
    <section className="max-w-6xl mx-auto px-6 py-20" id="case-files">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <p className="text-primary font-display tracking-[0.3em] mb-3">CLASSIFIED</p>
        <h2 className="font-display text-5xl text-foreground mb-4">CASE FILES</h2>
        <p className="text-muted-foreground mb-12 max-w-lg">
          Declassified records of NakeKnight's most critical mediations. Each file represents a conflict
          that could have ended in bloodshed — but didn't.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {caseFiles.map((c, i) => (
          <motion.button
            key={c.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            onClick={() => setSelectedCase(c)}
            className="group relative overflow-hidden rounded-lg border border-border bg-card text-left hover:border-primary/50 transition-colors"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={c.image}
                alt={c.codename}
                loading="lazy"
                width={1024}
                height={576}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
              <div className="absolute top-3 left-3 flex gap-2">
                <span className="px-2 py-0.5 bg-primary/90 text-primary-foreground text-xs font-display tracking-wider rounded-sm">
                  {c.threat}
                </span>
                <span className="px-2 py-0.5 bg-secondary text-secondary-foreground text-xs font-display tracking-wider rounded-sm">
                  {c.status}
                </span>
              </div>
              {c.hasVideo && (
                <div className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-primary/80 flex items-center justify-center">
                  <Play className="w-4 h-4 text-primary-foreground ml-0.5" />
                </div>
              )}
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground font-mono">{c.id} — {c.date}</span>
              </div>
              <h3 className="font-display text-2xl text-foreground mb-1">{c.codename}</h3>
              <p className="text-sm text-muted-foreground mb-3">{c.title}</p>
              <p className="text-sm text-muted-foreground/80 line-clamp-2">{c.summary}</p>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Case Detail Modal */}
      <AnimatePresence>
        {selectedCase && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            onClick={() => setSelectedCase(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto bg-card border border-border rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header image */}
              <div className="relative h-56">
                <img src={selectedCase.image} alt={selectedCase.codename} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                <button
                  onClick={() => setSelectedCase(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-card/80 flex items-center justify-center hover:bg-card transition-colors"
                >
                  <X className="w-4 h-4 text-foreground" />
                </button>
                <div className="absolute bottom-4 left-6">
                  <div className="flex gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-display tracking-wider rounded-sm">{selectedCase.threat}</span>
                    <span className="px-2 py-0.5 bg-secondary text-secondary-foreground text-xs font-display tracking-wider rounded-sm">{selectedCase.status}</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">{selectedCase.id} — {selectedCase.date}</p>
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-display text-4xl text-foreground mb-1">{selectedCase.codename}</h3>
                <p className="text-muted-foreground mb-6">{selectedCase.title}</p>

                <div className="mb-6 p-4 bg-secondary/30 rounded-lg border border-border">
                  <p className="text-sm text-primary font-display tracking-wider mb-1">SITUATION BRIEFING</p>
                  <p className="text-muted-foreground">{selectedCase.summary}</p>
                </div>

                <h4 className="font-display text-xl text-foreground mb-3">FIELD REPORT</h4>
                <div className="space-y-4 mb-6">
                  {selectedCase.narrative.split("\n\n").map((para, i) => (
                    <p key={i} className="text-muted-foreground leading-relaxed text-sm">
                      {para}
                    </p>
                  ))}
                </div>

                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-sm text-primary font-display tracking-wider mb-1">RESOLUTION</p>
                  <p className="text-foreground text-sm">{selectedCase.resolution}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
