import { useEffect, useState } from "react";
import { Headphones, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AudioPlayer from "@/components/AudioPlayer";
import MilestoneOffer from "@/components/MilestoneOffer";
import ShareButtons from "@/components/ShareButtons";
import { gaEvent } from "@/lib/ga4";
import { trackPlay } from "@/lib/track";

export default function EntryEpisode({ source = "home" }: { source?: string }) {
  const [episode, setEpisode] = useState<{ id: string; title: string; description: string | null } | null>(null);
  const [audio, setAudio] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.from("weekly_serials").select("id,title,description,audio_url")
        .eq("episode_number", 1).eq("is_published", true).eq("is_premium", false)
        .lte("release_date", new Date().toISOString()).maybeSingle();
      if (!active) return;
      setEpisode(data);
      if (data?.audio_url) {
        let url = data.audio_url;
        if (!url.startsWith("http")) {
          const { data: signed } = await supabase.storage.from("chronicles").createSignedUrl(url, 3600);
          url = signed?.signedUrl ?? "";
        }
        if (active) setAudio(url || null);
      }
      if (active) setLoading(false);
    })().catch(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  return (
    <section id="ep-1" className="max-w-3xl mx-auto px-6 py-10 scroll-mt-20">
      <p className="font-display text-xs text-primary mb-2">EPISODE 01 · FREE · NO SIGNUP</p>
      <h2 className="font-display text-4xl text-foreground mb-3">{episode?.title ?? "The Iron Pact"}</h2>
      {episode?.description && <p className="text-muted-foreground mb-5">{episode.description}</p>}
      {loading ? <p role="status" className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Checking episode audio…</p>
        : audio ? <AudioPlayer src={audio} title={episode?.title} onPlay={() => {
          gaEvent("episode_start", { episode_number: 1, source });
          if (episode) void trackPlay(episode.id);
        }} />
        : <div role="status" className="border border-border bg-muted p-5 rounded-md">
          <p className="flex items-center gap-2 text-foreground mb-2"><Headphones className="w-4 h-4 text-primary" /> Episode 01 audio is not available yet.</p>
          <p className="text-sm text-muted-foreground">Start with the Iron Pact case narrative below. No payment or signup is needed.</p>
        </div>}
      <MilestoneOffer source={source} />
      <ShareButtons url="/chronicles#ep-1" text="NakeKnight — The Peacemaker. Start with Episode 01: The Iron Pact." />
    </section>
  );
}