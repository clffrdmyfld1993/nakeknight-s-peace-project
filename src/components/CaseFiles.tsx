import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, X, Play } from "lucide-react";
import caseIronPact from "@/assets/case-iron-pact.jpg";
import caseNeonTruce from "@/assets/case-neon-truce.jpg";
import caseAshenAccord from "@/assets/case-ashen-accord.jpg";
import casePitPeace from "@/assets/case-pit-peace.jpg";
import caseDrownedTreaty from "@/assets/case-drowned-treaty.jpg";
import caseForgeAccord from "@/assets/case-forge-accord.jpg";
import caseHighwayKings from "@/assets/case-highway-kings.jpg";
import caseFrostLine from "@/assets/case-frost-line.jpg";
import caseMercyWard from "@/assets/case-mercy-ward.jpg";
import caseLastHaven from "@/assets/case-last-haven.jpg";

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
  videoFile?: string;
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
    videoFile: "nakeknight-iron-pact.mp4",
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
    videoFile: "nakeknight-neon-truce.mp4",
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
    videoFile: "nakeknight-ashen-accord.mp4",
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
    videoFile: "nakeknight-pit-peace.mp4",
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
  {
    id: "NK-0112",
    codename: "THE DROWNED TREATY",
    title: "Battle of the Flooded Capital",
    date: "2025.10.05",
    status: "RESOLVED",
    threat: "EXTREME",
    image: caseDrownedTreaty,
    videoFile: "nakeknight-drowned-treaty.mp4",
    summary: "Two naval factions controlling opposite banks of a flooded megacity. Trade routes severed. 20,000 civilians starving.",
    narrative: `When the sea walls collapsed, New Meridian became a canal city overnight. Admiral Hess controlled the northern waterways. Captain Orozco held the southern docks. Between them: six miles of flooded streets where 20,000 civilians were slowly starving.

Both sides sank supply boats meant for civilians, each accusing the other of smuggling weapons in relief shipments. They were both right.

NakeKnight arrived on a fishing boat. No flags. No armor. Just a waterproof case full of satellite imagery.

He called a meeting on neutral ground — the half-submerged roof of the old courthouse, water lapping at their boots. He spread the images across a makeshift table.

"You're fighting over shipping lanes," he said. "Meanwhile, the eastern breakwater is cracking. In six weeks, this entire district goes underwater. Every shipping lane you're fighting over will be fifty feet deep."

He proposed a joint engineering corps to reinforce the breakwater, with trade routes split by cargo type rather than geography. Food and medicine flow freely. Military supplies get inspected by a joint commission.

Admiral Hess refused. NakeKnight pulled up a live satellite feed showing cracks spreading through the breakwater in real-time. "You can fight over a city that won't exist in a month. Or you can save it together."

Hess signed at midnight. Orozco at dawn.`,
    resolution: "Breakwater reinforced in 23 days. Joint Trade Commission still operates. Civilian supply lines restored within 72 hours of signing.",
  },
  {
    id: "NK-0128",
    codename: "THE FORGE ACCORD",
    title: "Factory Revolt at Ironside Works",
    date: "2025.11.14",
    status: "RESOLVED",
    threat: "HIGH",
    image: caseForgeAccord,
    videoFile: "nakeknight-forge-accord.mp4",
    summary: "400 factory workers taken hostage by their own security force in a dispute over ration distribution.",
    narrative: `Ironside Works was the last functioning munitions factory in the eastern corridor. The workers made the bullets. The corporate security force distributed the rations. When the corporation cut rations by 40% to "increase productivity," the security team was ordered to enforce compliance. Instead, half of them sided with the workers.

The result: a three-way standoff. Workers barricaded inside with the machines. Loyal security outside with the weapons. Defecting security caught in the middle, holding the food stores.

NakeKnight arrived to find three groups of exhausted, hungry people pointing guns at each other over the thing they all needed to survive.

He started with the defectors — the ones everyone distrusted. "You broke your oath to protect these people," he told them. "Now prove it wasn't just cowardice."

He brokered a deal in stages. First, the defectors would distribute emergency rations to everyone — workers and loyal security alike. No conditions. Just food.

Hungry people think differently than starving people. After the first real meal in weeks, NakeKnight brought all three groups to the factory floor.

"The corporation isn't coming back," he told them flatly. "You're not employees anymore. You're a community. So decide how a community shares."

They argued for fourteen hours. NakeKnight mediated every minute. The Forge Accord established a worker-owned cooperative with elected security. Rations distributed by need, not rank.`,
    resolution: "Ironside Works operates as the region's first worker cooperative. Production up 30%. Ration disputes resolved by elected committee.",
  },
  {
    id: "NK-0134",
    codename: "HIGHWAY KINGS",
    title: "The Interstate Ceasefire",
    date: "2025.12.01",
    status: "RESOLVED",
    threat: "SEVERE",
    image: caseHighwayKings,
    videoFile: "nakeknight-highway-kings.mp4",
    summary: "Two motorcycle gangs controlling rival sections of the last functioning highway. Trade caravans ambushed weekly.",
    narrative: `Route 9 was the last artery connecting the coastal settlements to the inland farms. The Razorbacks controlled miles 0-80. The Iron Saints held 80-160. Anything caught in between got stripped for parts — vehicles, cargo, people.

Trade caravans lost three trucks a week. Farmers couldn't move crops. Medicine couldn't reach the coast. Both gangs claimed they were "protecting" their territory. Both were bleeding the region dry.

NakeKnight rode in on a beat-up motorcycle. No escort. He found Razorback leader "Throttle" Jacobs at a roadside chop shop and asked one question: "How much fuel do you burn per week chasing caravans?"

Throttle laughed. Then he did the math. The answer made him stop laughing.

NakeKnight proposed the Highway Compact: both gangs become paid escort services. Caravans pay a flat toll — split evenly — and get armed protection through the entire route. Ambushes end. Revenue goes up. Fuel costs plummet.

Iron Saints leader Maria "Chain" Delgado was harder to convince. "We're not truckers," she spat.

"No," NakeKnight agreed. "You're the most effective security force on this highway. Start charging for it instead of stealing from the people who need you."

It took two weeks of shuttle diplomacy between rest stops and roadside diners. The gangs met at the Route 9 overpass at midnight — the exact spot where they'd fought their bloodiest battle.

They shook hands in the headlights of forty motorcycles.`,
    resolution: "Route 9 trade volume up 400%. Both gangs earn more from escorts than they ever did from ambushes. Zero caravan losses in 8 months.",
  },
  {
    id: "NK-0147",
    codename: "THE FROST LINE",
    title: "Northern Mountain War",
    date: "2026.01.09",
    status: "RESOLVED",
    threat: "EXTREME",
    image: caseFrostLine,
    videoFile: "nakeknight-frost-line.mp4",
    summary: "Two highland armies locked in a winter siege over a mountain fortress controlling the only pass south. 6,000 troops freezing.",
    narrative: `Fort Karros sat at 8,000 feet, commanding the only passable route through the Ashcrest Mountains. General Petra Vane's Northern Guard had held it for a year. Warlord Shen Kai's Southern Alliance had been camped at the base for three months, waiting for a crack in the defenses.

Neither side could win. Vane couldn't break the siege. Kai couldn't take the walls. Meanwhile, winter was killing both armies slowly — frostbite, starvation, desertion.

NakeKnight climbed the mountain alone in a blizzard. He reached the fort walls at dawn, ice hanging from his armor, and shouted up to General Vane: "Your supply chain collapsed two weeks ago. You have food for eleven days."

Then he walked back down to Kai's camp. "Her walls are intact. Your trebuchets can't breach them. You have food for nine days."

He let both facts settle for 48 hours. Then he called the meeting.

It was held in a cave between the two positions — neutral ground chosen by NakeKnight because it was the only place warm enough for rational thought.

"The pass isn't a prize," he told them. "It's a service. Whoever controls it controls trade. The question is whether you want to control a frozen graveyard or a functioning economy."

The Frost Line Agreement established joint control of Fort Karros. Vane's troops man the walls. Kai's troops manage trade logistics. Toll revenue split 50/50. Any attack on the fort by either side forfeits their share permanently.

"You're asking us to trust each other," Vane said.

"I'm asking you to trust math," NakeKnight replied. "The numbers don't lie, even when generals do."`,
    resolution: "Fort Karros processes 200 trade caravans monthly. Both armies reduced to peacekeeping garrisons. Zero combat deaths since signing.",
  },
  {
    id: "NK-0155",
    codename: "MERCY WARD",
    title: "The Hospital Standoff",
    date: "2026.02.18",
    status: "RESOLVED",
    threat: "CRITICAL",
    image: caseMercyWard,
    videoFile: "nakeknight-mercy-ward.mp4",
    summary: "Armed faction seizes the last functioning hospital. Demands territory in exchange for releasing patients and staff.",
    narrative: `Saint Elara Hospital was the last place in the eastern districts where you could get surgery, antibiotics, or blood transfusions. When Colonel Marsh's militia seized it, they didn't hurt anyone — they just locked the doors and made their demands. Forty square blocks of territory, recognized sovereignty, and amnesty for their fighters.

Three hundred patients trapped inside. Sixty medical staff. Twelve of them children on life support.

The city council wanted to storm the building. NakeKnight stopped them with four words: "There are ventilators inside."

He requested 24 hours. He got 12.

NakeKnight walked into the hospital unarmed. He found Colonel Marsh in the administrator's office, drinking coffee from a mug that said "World's Best Nurse."

"You're not a monster, Marsh," NakeKnight said. "Monsters don't post guards at the pediatric ward to make sure the machines stay running."

Marsh stiffened. "I'm a pragmatist."

"Then let's be pragmatic. You can't hold this building forever. You don't have the medical knowledge to run it. And every hour you're here, patients are deteriorating because your soldiers make the doctors nervous."

NakeKnight's proposal was surgical: Marsh gets a 12-block zone — not 40 — with conditional sovereignty tied to maintaining peace. The hospital becomes permanently neutral ground, protected by both sides. And Marsh's fighters get first access to medical care in exchange for providing security.

"You're giving me less than I asked for," Marsh said.

"I'm giving you more than you deserve. Take the deal before the council's patience runs out."

Marsh took the deal. The patients were never moved. The ventilators never stopped.`,
    resolution: "Saint Elara Hospital declared neutral ground. Colonel Marsh's zone has the lowest violence rate in the district. Hospital capacity expanded 40%.",
  },
  {
    id: "NK-0168",
    codename: "LAST HAVEN",
    title: "The Bunker Summit",
    date: "2026.03.15",
    status: "RESOLVED",
    threat: "EXTREME",
    image: caseLastHaven,
    videoFile: "nakeknight-last-haven.mp4",
    summary: "Six faction leaders trapped in a bunker during a radiation storm. Three days to negotiate or tear each other apart.",
    narrative: `It was supposed to be a routine summit — six faction leaders meeting to discuss trade routes at Bunker 17. Then the radiation alarms went off. A toxic storm front, three days minimum. The blast doors sealed automatically.

Six leaders who hated each other. Forty bodyguards. One bunker. No way out.

By hour six, General Vane and Warlord Kai had nearly come to blows (again). Colonel Marsh was stockpiling water. The Razorback delegation was eyeing the armory. Captain Orozco had barricaded her section.

NakeKnight had planned this.

Not the storm — that was real. But the meeting location, the timing, the guest list. He'd studied weather patterns for months. He knew a storm was coming. He needed these six people in a room with no exit and no choice but to talk.

"You can kill each other," he announced over the intercom. "But the blast doors don't open for 72 hours regardless. So you'd be killing each other and then living with the bodies."

He spent the first day just keeping people alive. Breaking up fights. Rationing food. Making sure nobody poisoned anybody.

Day two, he started talking. One-on-ones in storage closets and maintenance corridors. Finding common ground between people who'd been at war for years.

Day three, he brought them all to the map table. Every faction's territory, resources, and vulnerabilities laid bare under fluorescent lights.

"You've all been playing a game none of you can win," he said. "You're spending 60% of your resources on defense against each other. Imagine what you could build with that 60%."

The Last Haven Accord was signed on a bunker table by six people who hadn't slept in three days. A mutual non-aggression pact. Shared resource mapping. Quarterly summits — above ground, with exits.

"Did you trap us in here on purpose?" General Vane asked as the blast doors finally opened.

NakeKnight squinted into the sunlight. "I scheduled a meeting. The weather was a coincidence."

Nobody believed him. Nobody cared.`,
    resolution: "The Last Haven Accord — the first multi-faction peace treaty in a decade. Resource conflicts down 70%. All six factions now participate in quarterly summits.",
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
            transition={{ delay: (i % 4) * 0.1 }}
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
              {c.videoFile && (
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
              <p className="text-sm text-muted-foreground line-clamp-2">{c.summary}</p>
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
