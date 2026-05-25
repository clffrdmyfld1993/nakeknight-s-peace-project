import { motion } from "framer-motion";
import SEO from "@/components/SEO";
import { Bot, ExternalLink, Play, Instagram, Twitter, Youtube, Globe } from "lucide-react";
import promoVideoAsset from "@/assets/promo/nakeknight-reel.mp4.asset.json";

const platforms = [
  { name: "TikTok", icon: Play, handle: "@nakeknight", url: "https://tiktok.com/@nakeknight", color: "bg-pink-500/10 text-pink-400 border-pink-500/20" },
  { name: "Instagram", icon: Instagram, handle: "@nakeknight", url: "https://instagram.com/nakeknight", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  { name: "X / Twitter", icon: Twitter, handle: "@NakeKnightIP", url: "https://x.com/NakeKnightIP", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  { name: "YouTube", icon: Youtube, handle: "NakeKnight™", url: "https://youtube.com/@nakeknight", color: "bg-red-500/10 text-red-400 border-red-500/20" },
];

const contentIdeas = [
  { type: "REEL", title: "Origin Story — 60s Edit", desc: "Cinematic montage of NakeKnight's transformation from soldier to peacemaker." },
  { type: "TIKTOK", title: "AI Built This Entire Business", desc: "Timelapse of building the brand with nothing but AI tools." },
  { type: "REEL", title: "Costume Reveal Series", desc: "Weekly drop: one new NakeKnight costume variant per episode." },
  { type: "SHORT", title: "Case File Dramatizations", desc: "30-second dramatic readings of each conflict resolution case." },
  { type: "TIKTOK", title: "From Idea to Revenue in 48hrs", desc: "Proof that AI can build a sellable IP faster than any studio." },
  { type: "REEL", title: "Fan Art Challenge", desc: "Community-submitted NakeKnight redesigns and mashups." },
];

export default function Social() {
  return (
    <div className="min-h-screen bg-background font-body pt-14">
      <SEO
        title="NakeKnight™ Broadcast — Social Channels & Content"
        description="Follow NakeKnight on TikTok, Instagram, X, and YouTube. Reels, shorts, costume reveals, and AI-built case file dramatizations."
        path="/social"
      />
      <div className="max-w-6xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-primary font-display tracking-[0.3em]">BROADCAST</p>
            <span className="inline-flex items-center gap-1 text-[10px] text-primary/60 bg-primary/5 border border-primary/10 rounded px-1.5 py-0.5">
              <Bot className="w-3 h-3" /> AI Marketing
            </span>
          </div>
          <h1 className="font-display text-6xl md:text-7xl text-foreground mb-4">NAKEKNIGHT™ SOCIAL HUB</h1>
          <p className="text-muted-foreground max-w-xl">
            Follow NakeKnight™ across every platform. AI-generated content, weekly drops, and community engagement.
          </p>
        </motion.div>

        {/* Promo Video */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-16"
        >
          <h2 className="font-display text-3xl text-foreground mb-4">LATEST PROMO</h2>
          <div className="max-w-sm mx-auto rounded-lg overflow-hidden border border-border bg-card">
            <video
              src={promoVideoAsset.url}
              controls
              playsInline
              className="w-full aspect-[9/16] object-cover"
              poster=""
            />
            <div className="p-4">
              <p className="font-display text-lg text-foreground">NAKEKNIGHT™ — THE PEACEMAKER</p>
              <p className="text-sm text-muted-foreground mt-1">9:16 vertical reel • Ready for TikTok, Reels & Shorts</p>
              <div className="mt-2 flex items-center gap-1 text-[10px] text-primary/50">
                <Bot className="w-3 h-3" /> AI-Generated Video
              </div>
            </div>
          </div>
        </motion.div>

        {/* Social Platforms */}
        <div className="mb-16">
          <h2 className="font-display text-3xl text-foreground mb-6">FOLLOW EVERYWHERE</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {platforms.map((p, i) => (
              <motion.a
                key={p.name}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex items-center gap-3 p-4 rounded-lg border ${p.color} hover:scale-105 transition-transform`}
              >
                <p.icon className="w-6 h-6" aria-hidden="true" />
                <div>
                  <p className="font-display text-sm">{p.name}</p>
                  <p className="text-xs opacity-90">{p.handle}</p>
                </div>
                <ExternalLink className="w-4 h-4 ml-auto opacity-70" aria-hidden="true" />
              </motion.a>
            ))}
          </div>
        </div>

        {/* Content Calendar */}
        <div>
          <h2 className="font-display text-3xl text-foreground mb-2">CONTENT PIPELINE</h2>
          <p className="text-muted-foreground text-sm mb-6">AI-scripted, AI-edited, AI-distributed. Here's what's coming.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contentIdeas.map((idea, i) => (
              <motion.div
                key={idea.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-card border border-border rounded-lg p-5 hover:border-primary/30 transition-colors"
              >
                <span className="text-[10px] text-primary font-display tracking-widest">{idea.type}</span>
                <h3 className="font-display text-lg text-foreground mt-1">{idea.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{idea.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
