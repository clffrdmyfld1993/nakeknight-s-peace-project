import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX, Loader2 } from "lucide-react";

interface AudioPlayerProps {
  src: string;
  title?: string;
}

const fmt = (s: number) => {
  if (!isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${r.toString().padStart(2, "0")}`;
};

export default function AudioPlayer({ src, title }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => setCurrent(a.currentTime);
    const onMeta = () => setDuration(a.duration || 0);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnd = () => setPlaying(false);
    const onWait = () => setLoading(true);
    const onPlaying = () => setLoading(false);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("ended", onEnd);
    a.addEventListener("waiting", onWait);
    a.addEventListener("playing", onPlaying);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onMeta);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("ended", onEnd);
      a.removeEventListener("waiting", onWait);
      a.removeEventListener("playing", onPlaying);
    };
  }, [src]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) a.pause();
    else a.play().catch(() => setPlaying(false));
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const a = audioRef.current;
    if (!a || !duration) return;
    const v = Number(e.target.value);
    a.currentTime = (v / 100) * duration;
    setCurrent(a.currentTime);
  };

  const toggleMute = () => {
    const a = audioRef.current;
    if (!a) return;
    a.muted = !a.muted;
    setMuted(a.muted);
  };

  const pct = duration ? (current / duration) * 100 : 0;

  return (
    <div className="w-full p-4 bg-card border border-primary/20 rounded-lg shadow-[0_0_30px_-15px_hsl(var(--primary)/0.5)]">
      <audio ref={audioRef} src={src} preload="metadata" />

      <div className="flex items-center gap-4">
        <button
          onClick={toggle}
          aria-label={playing ? "Pause" : "Play"}
          className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors shadow-[0_0_20px_-5px_hsl(var(--primary))]"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : playing ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          {title && (
            <div className="font-display text-sm text-foreground tracking-wider truncate mb-1.5">
              {title}
            </div>
          )}
          <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-primary"
              style={{ width: `${pct}%`, boxShadow: "0 0 8px hsl(var(--primary))" }}
            />
            <input
              type="range"
              min={0}
              max={100}
              value={pct}
              onChange={seek}
              aria-label="Seek"
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
            />
          </div>
          <div className="flex justify-between mt-1.5 text-[10px] font-mono text-muted-foreground">
            <span>{fmt(current)}</span>
            <span>{fmt(duration)}</span>
          </div>
        </div>

        <button
          onClick={toggleMute}
          aria-label={muted ? "Unmute" : "Mute"}
          className="flex-shrink-0 w-9 h-9 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 flex items-center justify-center transition-colors"
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
