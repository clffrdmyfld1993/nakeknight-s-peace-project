import { motion } from "framer-motion";
import { Rocket, BookOpen, Gamepad2, Shirt, Wand2 } from "lucide-react";
import SEO from "@/components/SEO";
import LeadCapture from "@/components/LeadCapture";

export default function Universe() {
  return (
    <div className="min-h-screen bg-background font-body pt-14">
      <SEO
        title="The HeroDossier Universe — NakeKnight, Comics, Figures, Games"
        description="NakeKnight is the audio gateway to the HeroDossier universe. Comics, action figures, RPG modules, and games — founder-owned IP. Join the launch list."
        path="/universe"
      />
      <div className="max-w-4xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-primary font-display tracking-[0.3em] text-xs mb-2">HERODOSSIER UNIVERSE</p>
          <h1 className="font-display text-5xl md:text-7xl text-foreground mb-4 leading-[0.95]">
            AUDIO IS JUST<br />CHAPTER ONE.
          </h1>
          <p className="text-muted-foreground max-w-2xl mb-12">
            NakeKnight — The Peacemaker is the entry point to a full founder-owned IP universe. Comics.
            Action figures. RPG modules. Cross-media drops. The saga expands from here.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-4 mb-14">
          {[
            { icon: BookOpen, name: "Chronicles Audio", status: "LIVE — WEEKLY DROPS", live: true },
            { icon: Wand2, name: "Comic Series", status: "IN PRODUCTION" },
            { icon: Shirt, name: "Action Figures", status: "PROTOTYPE PHASE" },
            { icon: Gamepad2, name: "RPG Modules & Games", status: "CONCEPT" },
          ].map((c) => (
            <div
              key={c.name}
              className={`p-5 rounded-lg border ${c.live ? "bg-primary/10 border-primary/40" : "bg-card border-border"}`}
            >
              <div className="flex items-center gap-3">
                <c.icon className={`w-5 h-5 ${c.live ? "text-primary" : "text-muted-foreground"}`} />
                <div>
                  <p className="font-display text-lg text-foreground">{c.name}</p>
                  <p className={`text-[10px] tracking-[0.25em] ${c.live ? "text-primary" : "text-muted-foreground"}`}>
                    {c.status}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 md:p-8 bg-card/70 border border-primary/30 rounded-lg shadow-[0_0_80px_-40px_hsl(var(--primary))]">
          <div className="flex items-center gap-2 mb-2">
            <Rocket className="w-4 h-4 text-primary" />
            <p className="font-display tracking-widest text-xs text-primary">IP LAUNCH LIST</p>
          </div>
          <h2 className="font-display text-3xl text-foreground mb-2">Be first when the figures drop.</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Get launch-day access to physical drops, early comic previews, and the founder journal from behind the
            universe. No spam — signal only.
          </p>
          <LeadCapture
            source="universe_waitlist"
            magnet="HeroDossier IP Launch List"
            buttonLabel="JOIN WAITLIST"
            successMessage="You're on the launch list. Watch for the first drop."
            compact
          />
        </div>
      </div>
    </div>
  );
}
