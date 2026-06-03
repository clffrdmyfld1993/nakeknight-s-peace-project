import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Lock, Calendar, Headphones, ChevronDown, ChevronUp } from "lucide-react";
import SEO from "@/components/SEO";
import AudioPlayer from "@/components/AudioPlayer";
import { supabase } from "@/integrations/supabase/client";

interface Episode {
  id: string;
  title: string;
  episode_number: number;
  description: string | null;
  transcript_text: string | null;
  audio_url: string | null;
  cover_url: string | null;
  duration_seconds: number | null;
  release_date: string;
  is_published: boolean;
}

const resolveAudioUrl = async (raw: string | null): Promise<string | null> => {
  if (!raw) return null;
  if (raw.startsWith("http")) return raw;
  // Treat as storage path inside the `chronicles` bucket
  const { data, error } = await supabase.storage
    .from("chronicles")
    .createSignedUrl(raw, 60 * 60 * 6); // 6h
  if (error) return null;
  return data.signedUrl;
};

const Countdown = ({ to }: { to: string }) => {
  const target = useMemo(() => new Date(to).getTime(), [to]);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);
  const diff = Math.max(0, target - now);
  const d = Math.floor(diff / 86_400_000);
  const h = Math.floor((diff % 86_400_000) / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);
  const seg = (n: number, l: string) => (
    <div className="flex flex-col items-center">
      <span className="font-display text-3xl md:text-4xl text-primary tabular-nums">
        {n.toString().padStart(2, "0")}
      </span>
      <span className="text-[10px] tracking-[0.2em] text-muted-foreground mt-1">{l}</span>
    </div>
  );
  return (
    <div className="flex items-center gap-5 md:gap-7">
      {seg(d, "DAYS")}
      <span className="text-primary/40 font-display text-2xl">:</span>
      {seg(h, "HRS")}
      <span className="text-primary/40 font-display text-2xl">:</span>
      {seg(m, "MIN")}
      <span className="text-primary/40 font-display text-2xl">:</span>
      {seg(s, "SEC")}
    </div>
  );
};

const EpisodeCard = ({ ep }: { ep: Episode }) => {
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    let active = true;
    resolveAudioUrl(ep.audio_url).then((url) => {
      if (active) setAudioSrc(url);
    });
    return () => {
      active = false;
    };
  }, [ep.audio_url]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="p-6 md:p-8 bg-card/60 border border-border rounded-lg backdrop-blur-sm"
    >
      <div className="flex items-start justify-between gap-4 mb-2">
        <p className="font-display text-xs tracking-[0.3em] text-primary">
          EPISODE {ep.episode_number.toString().padStart(2, "0")}
        </p>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
          {new Date(ep.release_date).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>
      <h2 className="font-display text-3xl md:text-4xl text-foreground mb-3 leading-tight">
        {ep.title}
      </h2>
      {ep.description && (
        <p className="text-muted-foreground leading-relaxed mb-6 max-w-2xl">{ep.description}</p>
      )}

      {audioSrc ? (
        <AudioPlayer src={audioSrc} title={ep.title} />
      ) : (
        <div className="p-4 bg-muted/40 border border-dashed border-border rounded-lg text-sm text-muted-foreground flex items-center gap-2">
          <Headphones className="w-4 h-4" /> Audio not yet uploaded for this episode.
        </div>
      )}

      {ep.transcript_text && (
        <div className="mt-5">
          <button
            onClick={() => setShowTranscript((v) => !v)}
            className="inline-flex items-center gap-1.5 text-xs font-display tracking-widest text-muted-foreground hover:text-primary transition-colors"
          >
            {showTranscript ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {showTranscript ? "HIDE TRANSCRIPT" : "READ TRANSCRIPT"}
          </button>
          {showTranscript && (
            <div className="mt-3 p-4 bg-background/60 border border-border rounded-md text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
              {ep.transcript_text}
            </div>
          )}
        </div>
      )}
    </motion.article>
  );
};

export default function Chronicles() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("weekly_serials")
        .select("*")
        .order("episode_number", { ascending: false });
      setEpisodes((data as Episode[]) || []);
      setLoading(false);
    })();
  }, []);

  const nowIso = new Date().toISOString();
  const released = episodes.filter((e) => e.release_date <= nowIso);
  const upcoming = episodes
    .filter((e) => e.release_date > nowIso)
    .sort((a, b) => a.release_date.localeCompare(b.release_date));
  const nextEp = upcoming[0];

  return (
    <div className="min-h-screen bg-background font-body pt-14 relative">
      <SEO
        title="Chronicles — NakeKnight™ Weekly Audio Drama"
        description="A serialized audio saga from the NakeKnight universe. New episode every week — fully AI-built scripts, voice, and score."
        path="/chronicles"
      />

      {/* Atmospheric backdrop */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-[140px]" />
      </div>

      <div className="relative max-w-3xl mx-auto px-6 py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <p className="text-primary font-display tracking-[0.3em] mb-3">CHRONICLES</p>
          <h1 className="font-display text-6xl md:text-7xl text-foreground mb-6 leading-[0.9]">
            THE WEEKLY<br />SAGA
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
            A serialized audio drama from the NakeKnight universe. Every episode — script, voice, score — built entirely by AI. New chapter drops every week.
          </p>
        </motion.div>

        {/* Countdown */}
        {nextEp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-14 p-6 md:p-8 bg-card/50 border border-primary/30 rounded-lg backdrop-blur-sm text-center shadow-[0_0_60px_-30px_hsl(var(--primary))]"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Lock className="w-3.5 h-3.5 text-primary" />
              <p className="font-display text-xs tracking-[0.3em] text-primary">
                NEXT EPISODE UNLOCKS IN
              </p>
            </div>
            <Countdown to={nextEp.release_date} />
            <p className="mt-5 font-display text-lg text-foreground">
              EP {nextEp.episode_number.toString().padStart(2, "0")} — {nextEp.title}
            </p>
            {nextEp.description && (
              <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                {nextEp.description}
              </p>
            )}
          </motion.div>
        )}

        {/* Episode list */}
        {loading ? (
          <div className="text-center text-muted-foreground text-sm py-12">Loading the saga…</div>
        ) : released.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-12 flex items-center justify-center gap-2">
            <Calendar className="w-4 h-4" /> First episode drops soon.
          </div>
        ) : (
          <div className="space-y-6">
            {released.map((ep) => (
              <EpisodeCard key={ep.id} ep={ep} />
            ))}
          </div>
        )}

        <div className="mt-16 text-center text-[10px] tracking-[0.3em] text-muted-foreground">
          NEW CHAPTER · EVERY WEEK · BUILT BY AI
        </div>
      </div>
    </div>
  );
}
