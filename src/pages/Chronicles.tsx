import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Lock, Calendar, Headphones, ChevronDown, ChevronUp, Sparkles, Loader2 } from "lucide-react";
import SEO from "@/components/SEO";
import AudioPlayer from "@/components/AudioPlayer";
import ShareButtons from "@/components/ShareButtons";
import LeadCapture from "@/components/LeadCapture";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  is_premium: boolean;
}

const PREMIUM_PRICE = "price_1TelQGQaKvygaDfuazPCyTBv";
const PREMIUM_KEY = "nk_premium_session";

const resolveFreeAudioUrl = async (raw: string | null): Promise<string | null> => {
  if (!raw) return null;
  if (raw.startsWith("http")) return raw;
  const { data, error } = await supabase.storage
    .from("chronicles")
    .createSignedUrl(raw, 60 * 60 * 6);
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
      {seg(d, "DAYS")}<span className="text-primary/40 font-display text-2xl">:</span>
      {seg(h, "HRS")}<span className="text-primary/40 font-display text-2xl">:</span>
      {seg(m, "MIN")}<span className="text-primary/40 font-display text-2xl">:</span>
      {seg(s, "SEC")}
    </div>
  );
};

const startPremiumCheckout = async () => {
  const referral =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("ref")
      : null;
  const { data, error } = await supabase.functions.invoke("create-payment", {
    body: { items: [{ price: PREMIUM_PRICE, quantity: 1 }], referral, source: "chronicles" },
  });
  if (error || !data?.url) {
    toast.error(error?.message || "Could not start checkout");
    return;
  }
  window.location.href = data.url;
};

const EpisodeCard = ({ ep, premiumSession }: { ep: Episode; premiumSession: string | null }) => {
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const locked = ep.is_premium && !premiumSession;

  useEffect(() => {
    if (locked) return;
    let active = true;
    (async () => {
      setLoadingAudio(true);
      if (ep.is_premium && premiumSession) {
        // Get gated audio via fulfill-purchase
        const { data } = await supabase.functions.invoke("fulfill-purchase", {
          body: { session_id: premiumSession, episode_id: ep.id },
        });
        if (active) {
          if (data?.episode_audio_url) {
            setAudioSrc(data.episode_audio_url);
          } else if (data?.paid === false) {
            // session invalid — clear it
            localStorage.removeItem(PREMIUM_KEY);
          }
        }
      } else {
        const url = await resolveFreeAudioUrl(ep.audio_url);
        if (active) setAudioSrc(url);
      }
      if (active) setLoadingAudio(false);
    })();
    return () => { active = false; };
  }, [ep.id, ep.is_premium, ep.audio_url, premiumSession, locked]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`p-6 md:p-8 bg-card/60 border rounded-lg backdrop-blur-sm ${
        ep.is_premium ? "border-primary/40 shadow-[0_0_60px_-40px_hsl(var(--primary))]" : "border-border"
      }`}
    >
      <div className="flex items-start justify-between gap-4 mb-2">
        <p className="font-display text-xs tracking-[0.3em] text-primary">
          EPISODE {ep.episode_number.toString().padStart(2, "0")}
          {ep.is_premium && <span className="ml-2 px-1.5 py-0.5 bg-primary/15 text-primary text-[9px] tracking-widest rounded-sm">PREMIUM</span>}
        </p>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
          {new Date(ep.release_date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
        </p>
      </div>
      <h2 className="font-display text-3xl md:text-4xl text-foreground mb-3 leading-tight">{ep.title}</h2>
      {ep.description && (
        <p className="text-muted-foreground leading-relaxed mb-6 max-w-2xl">{ep.description}</p>
      )}

      {locked ? (
        <div className="p-6 bg-background/60 border border-primary/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-4 h-4 text-primary" />
            <p className="font-display text-xs tracking-widest text-primary">PREMIUM EPISODE — LOCKED</p>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            This chapter is part of the Premium Chronicles tier. Unlock lifetime access to every premium drop for a single payment.
          </p>
          <button
            onClick={startPremiumCheckout}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-display tracking-widest text-sm rounded-sm hover:opacity-90"
          >
            <Sparkles className="w-4 h-4" /> UPGRADE — $29 LIFETIME
          </button>
        </div>
      ) : loadingAudio ? (
        <div className="p-4 bg-muted/40 border border-dashed border-border rounded-lg text-sm text-muted-foreground flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Preparing stream…
        </div>
      ) : audioSrc ? (
        <AudioPlayer src={audioSrc} title={ep.title} />
      ) : (
        <div className="p-4 bg-muted/40 border border-dashed border-border rounded-lg text-sm text-muted-foreground flex items-center gap-2">
          <Headphones className="w-4 h-4" /> Audio not yet uploaded for this episode.
        </div>
      )}

      {ep.transcript_text && !locked && (
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

      <ShareButtons
        url={`/chronicles#ep-${ep.episode_number}`}
        text={`🎙️ NAKEKNIGHT EP${ep.episode_number.toString().padStart(2, "0")} — ${ep.title}`}
      />
    </motion.article>
  );
};

export default function Chronicles() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [premiumSession, setPremiumSession] = useState<string | null>(null);

  useEffect(() => {
    setPremiumSession(localStorage.getItem(PREMIUM_KEY));
  }, []);

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
  const hasPremiumEpisodes = released.some((e) => e.is_premium);

  return (
    <div className="min-h-screen bg-background font-body pt-14 relative">
      <SEO
        title="Chronicles — NakeKnight™ Weekly Audio Drama"
        description="Serialized audio drama from the NakeKnight universe. New episode every week — fully AI-built scripts, voice, and score. Free starters + $29 lifetime premium access."
        path="/chronicles"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "PodcastSeries",
            name: "NakeKnight Chronicles",
            url: "https://herodossier.lovable.app/chronicles",
            description:
              "Serialized audio drama following NakeKnight — The Peacemaker — an empathic mediator navigating a staged reality. Built entirely by AI.",
            author: { "@type": "Organization", name: "NakeKnight" },
            inLanguage: "en",
          },
          ...released.slice(0, 20).map((e) => ({
            "@context": "https://schema.org",
            "@type": "PodcastEpisode",
            name: `EP ${e.episode_number.toString().padStart(2, "0")} — ${e.title}`,
            description: e.description ?? undefined,
            datePublished: e.release_date,
            url: `https://herodossier.lovable.app/chronicles#ep-${e.episode_number}`,
            partOfSeries: { "@type": "PodcastSeries", name: "NakeKnight Chronicles" },
          })),
        ]}
      />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-[140px]" />
      </div>

      <div className="relative max-w-3xl mx-auto px-6 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <p className="text-primary font-display tracking-[0.3em] mb-3">CHRONICLES</p>
          <h1 className="font-display text-6xl md:text-7xl text-foreground mb-6 leading-[0.9]">
            THE WEEKLY<br />SAGA
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
            A serialized audio drama from the NakeKnight universe. Every episode — script, voice, score — built entirely by AI. New chapter drops every week.
          </p>
        </motion.div>

        {/* Premium upsell banner */}
        {hasPremiumEpisodes && !premiumSession && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mb-10 p-5 bg-primary/10 border border-primary/30 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
          >
            <div>
              <p className="font-display text-sm tracking-widest text-primary mb-1">PREMIUM CHRONICLES</p>
              <p className="text-sm text-muted-foreground">Unlock every premium-only chapter — lifetime access, one payment.</p>
            </div>
            <button
              onClick={startPremiumCheckout}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-display tracking-widest text-sm rounded-sm hover:opacity-90"
            >
              <Sparkles className="w-4 h-4" /> UPGRADE — $29
            </button>
          </motion.div>
        )}
        {premiumSession && (
          <div className="mb-10 px-4 py-2 text-xs font-display tracking-widest text-primary border border-primary/30 rounded-sm inline-flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" /> PREMIUM ACCESS ACTIVE
          </div>
        )}

        {nextEp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="mb-14 p-6 md:p-8 bg-card/50 border border-primary/30 rounded-lg backdrop-blur-sm text-center shadow-[0_0_60px_-30px_hsl(var(--primary))]"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Lock className="w-3.5 h-3.5 text-primary" />
              <p className="font-display text-xs tracking-[0.3em] text-primary">NEXT EPISODE UNLOCKS IN</p>
            </div>
            <Countdown to={nextEp.release_date} />
            <p className="mt-5 font-display text-lg text-foreground">
              EP {nextEp.episode_number.toString().padStart(2, "0")} — {nextEp.title}
            </p>
            {nextEp.description && (
              <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">{nextEp.description}</p>
            )}
          </motion.div>
        )}

        {loading ? (
          <div className="text-center text-muted-foreground text-sm py-12">Loading the saga…</div>
        ) : released.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-12 flex items-center justify-center gap-2">
            <Calendar className="w-4 h-4" /> First episode drops soon.
          </div>
        ) : (
          <div className="space-y-6">
            {released.map((ep) => (
              <EpisodeCard key={ep.id} ep={ep} premiumSession={premiumSession} />
            ))}
          </div>
        )}

        <div className="mt-16 p-6 md:p-8 bg-card/60 border border-primary/30 rounded-lg">
          <p className="font-display tracking-widest text-xs text-primary mb-2">EPISODE ALERTS</p>
          <h3 className="font-display text-2xl text-foreground mb-2">Get new chapters + exclusive lore</h3>
          <p className="text-sm text-muted-foreground mb-4">
            One email per drop. No spam. Unsubscribe any time.
          </p>
          <LeadCapture
            source="chronicles"
            magnet="Chronicles Drop Alerts"
            buttonLabel="ALERT ME"
            successMessage="You're on the list. Next drop will hit your inbox."
            compact
          />
        </div>

        <div className="mt-12 text-center text-[10px] tracking-[0.3em] text-muted-foreground">
          NEW CHAPTER · EVERY WEEK · BUILT BY AI
        </div>
      </div>
    </div>
  );
}
