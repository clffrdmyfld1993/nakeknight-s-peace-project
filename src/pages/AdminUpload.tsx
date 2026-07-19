import { useEffect, useState } from "react";
import { Sparkles, Zap, ScrollText } from "lucide-react";
import { motion } from "framer-motion";
import { Upload, Lock, CheckCircle2, Loader2, Trash2, Eye, EyeOff } from "lucide-react";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";


interface Serial {
  id: string;
  title: string;
  episode_number: number;
  description: string | null;
  transcript_text: string | null;
  audio_url: string | null;
  release_date: string;
  is_published: boolean;
  is_premium?: boolean;
}

const TOKEN_KEY = "nk_admin_token";

export default function AdminUpload() {
  const [token, setToken] = useState<string>("");
  const [tokenInput, setTokenInput] = useState("");
  const [episodes, setEpisodes] = useState<Serial[]>([]);
  const [loading, setLoading] = useState(false);

  // form state
  const [title, setTitle] = useState("");
  const [episodeNumber, setEpisodeNumber] = useState<number>(1);
  const [description, setDescription] = useState("");
  const [transcript, setTranscript] = useState("");
  const [releaseDate, setReleaseDate] = useState(() =>
    new Date().toISOString().slice(0, 16)
  );
  const [isPublished, setIsPublished] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState("");

  // AI generator state
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiVoice, setAiVoice] = useState("af_bella");
  const [aiAudio, setAiAudio] = useState(true);
  const [aiPublish, setAiPublish] = useState(false);
  const [aiPremium, setAiPremium] = useState(false);
  const [aiCount, setAiCount] = useState(1);
  const [aiWeekly, setAiWeekly] = useState(true);
  const [aiBusy, setAiBusy] = useState(false);
  const [lastShareText, setLastShareText] = useState<string>("");
  const [promoBusy, setPromoBusy] = useState<string | null>(null);
  const [promoAssets, setPromoAssets] = useState<{
    ep: { title: string; episode_number: number } | null;
    x_thread?: string[];
    reddit_post?: { title: string; body: string };
    ig_caption?: string;
    video_script?: string;
  } | null>(null);

  // Autonomous engine state
  const [autoBusy, setAutoBusy] = useState(false);
  const [autoLastResult, setAutoLastResult] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [lore, setLore] = useState<any[]>([]);

  const runAutoWeekly = async () => {
    if (!confirm("Run the autonomous weekly episode now? This will generate + publish a new episode using the current lore + prior context.")) return;
    setAutoBusy(true);
    setAutoLastResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("auto-publish-weekly", {
        headers: { "x-admin-token": token },
      });
      if (error) throw new Error(error.message);
      setAutoLastResult(data);
      if ((data as any)?.ok) {
        toast({
          title: (data as any).skipped ? "Already ran this week" : `Episode ${(data as any).episode_number} published`,
          description: (data as any).skipped ? "Idempotent skip." : "Autonomous engine complete.",
        });
      } else {
        toast({ title: "Run failed", description: (data as any)?.error || "See logs", variant: "destructive" });
      }
      await Promise.all([refresh(), loadLogs(), loadLore()]);
    } catch (err: any) {
      toast({ title: "Auto-run failed", description: err.message, variant: "destructive" });
    } finally {
      setAutoBusy(false);
    }
  };

  const loadLogs = async () => {
    try {
      const { data } = await supabase
        .from("automation_logs" as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      setLogs((data as any) || []);
    } catch {
      // service-role only; requires calling via edge function in production. Silent for now.
    }
  };

  const loadLore = async () => {
    try {
      const { data } = await supabase
        .from("lore_bible" as any)
        .select("*")
        .order("first_seen_episode", { ascending: false })
        .limit(100);
      setLore((data as any) || []);
    } catch {}
  };


  const runAiGenerate = async () => {
    if (aiPrompt.trim().length < 4) {
      toast({ title: "Give the engine a prompt", variant: "destructive" });
      return;
    }
    setAiBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-episode", {
        body: {
          prompt: aiPrompt.trim(),
          episode_number: episodeNumber,
          voice: aiVoice || undefined,
          generate_audio: aiAudio,
          publish: aiPublish,
          premium: aiPremium,
          count: Math.max(1, Math.min(8, aiCount)),
          weekly_offset: aiCount > 1 ? aiWeekly : false,
        },
        headers: { "x-admin-token": token },
      });
      if (error) throw new Error(error.message);
      if ((data as any)?.error) throw new Error((data as any).error);

      const gen = (data as any).generated ?? ((data as any).row ? 1 : 0);
      const first = (data as any).results?.[0] ?? data;
      const title = first?.title || first?.row?.title || "Episode";
      toast({
        title: `Generated ${gen} episode${gen === 1 ? "" : "s"}`,
        description: `Starting EP ${episodeNumber} — ${title}`,
      });

      // Build a share template the admin can paste anywhere
      const template =
        `🎙️ NEW NAKEKNIGHT DROP\n\n` +
        `EP${String(episodeNumber).padStart(2, "0")} — ${title}\n\n` +
        `Free episodes weekly. Lifetime access $29.\n` +
        `Listen → https://herodossier.lovable.app/chronicles\n\n` +
        `#audiodrama #ai #nakeknight`;
      setLastShareText(template);

      setAiPrompt("");
      await refresh();
    } catch (err: any) {
      toast({ title: "AI generate failed", description: err.message, variant: "destructive" });
    } finally {
      setAiBusy(false);
    }
  };

  const copyShareTemplate = async () => {
    if (!lastShareText) return;
    try {
      await navigator.clipboard.writeText(lastShareText);
      toast({ title: "Share template copied" });
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };



  useEffect(() => {
    const saved = sessionStorage.getItem(TOKEN_KEY);
    if (saved) setToken(saved);
  }, []);

  const generatePromo = async (ep: Serial) => {
    setPromoBusy(ep.id);
    try {
      const { data, error } = await supabase.functions.invoke("generate-episode", {
        body: { mode: "promo", episode_id: ep.id },
        headers: { "x-admin-token": token },
      });
      if (error) throw new Error(error.message);
      if ((data as any)?.error) throw new Error((data as any).error);
      const promo = (data as any).promo ?? {};
      setPromoAssets({
        ep: { title: ep.title, episode_number: ep.episode_number },
        x_thread: promo.x_thread,
        reddit_post: promo.reddit_post,
        ig_caption: promo.ig_caption,
        video_script: promo.video_script,
      });
      toast({ title: "Promo assets ready", description: `EP ${ep.episode_number} — ${ep.title}` });
    } catch (err: any) {
      toast({ title: "Promo generate failed", description: err.message, variant: "destructive" });
    } finally {
      setPromoBusy(null);
    }
  };

  const copyText = async (text: string, label = "Copied") => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: label });
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (token) {
      refresh();
      loadLore();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);


  const callAdmin = async (body: any) => {
    const { data, error } = await supabase.functions.invoke("admin-serials", {
      body,
      headers: { "x-admin-token": token },
    });
    if (error) throw new Error(error.message || "Request failed");
    if ((data as any)?.error) throw new Error((data as any).error);
    return data as any;
  };

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await callAdmin({ action: "list" });
      const rows = (res?.rows || []) as Serial[];
      // newest first for display
      const sorted = [...rows].sort((a, b) => b.episode_number - a.episode_number);
      setEpisodes(sorted);
      if (rows.length > 0) {
        setEpisodeNumber(Math.max(...rows.map((d) => d.episode_number)) + 1);
      }
    } catch (err: any) {
      toast({ title: "Auth failed", description: err.message, variant: "destructive" });
      sessionStorage.removeItem(TOKEN_KEY);
      setToken("");
    } finally {
      setLoading(false);
    }
  };

  const handleGate = (e: React.FormEvent) => {
    e.preventDefault();
    if (tokenInput.trim().length < 8) {
      toast({ title: "Token must be ≥8 chars", variant: "destructive" });
      return;
    }
    sessionStorage.setItem(TOKEN_KEY, tokenInput.trim());
    setToken(tokenInput.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      let audioPath: string | null = null;

      if (file) {
        setProgress("Requesting signed upload URL…");
        const ext = (file.name.split(".").pop() || "mp3").toLowerCase();
        const safe = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
        const path = `ep-${String(episodeNumber).padStart(2, "0")}-${safe}-${Date.now()}.${ext}`;
        const signed = await callAdmin({ action: "signed_upload", path });

        setProgress("Uploading audio…");
        // Use the official client helper to honor the signed token
        const { error: upErr } = await supabase.storage
          .from("chronicles")
          .uploadToSignedUrl(signed.path, signed.token, file, {
            contentType: file.type || "audio/mpeg",
            upsert: false,
          });
        if (upErr) throw upErr;
        audioPath = signed.path;
      }

      setProgress("Saving episode row…");
      await callAdmin({
        action: "create",
        data: {
          title: title.trim(),
          episode_number: episodeNumber,
          description: description.trim() || null,
          transcript_text: transcript.trim() || null,
          audio_url: audioPath,
          release_date: new Date(releaseDate).toISOString(),
          is_published: isPublished,
          is_premium: isPremium,
        },
      });

      toast({ title: "Episode saved", description: `EP ${episodeNumber} — ${title}` });
      setTitle("");
      setDescription("");
      setTranscript("");
      setFile(null);
      setIsPremium(false);
      await refresh();
    } catch (err: any) {
      toast({
        title: "Save failed",
        description: err?.message || "Unknown error",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
      setProgress("");
    }
  };

  const togglePublish = async (ep: Serial) => {
    try {
      await callAdmin({
        action: "update",
        id: ep.id,
        data: { is_published: !ep.is_published },
      });
      refresh();
    } catch (err: any) {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    }
  };

  const togglePremium = async (ep: Serial) => {
    try {
      await callAdmin({
        action: "update",
        id: ep.id,
        data: { is_premium: !ep.is_premium },
      });
      refresh();
    } catch (err: any) {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    }
  };

  const remove = async (ep: Serial) => {
    if (!confirm(`Delete EP ${ep.episode_number} — ${ep.title}?`)) return;
    try {
      await callAdmin({ action: "delete", id: ep.id });
      refresh();
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-background font-body pt-14 flex items-center justify-center px-6">
        <SEO title="Admin — NakeKnight" description="Restricted." path="/admin-upload" />
        <form
          onSubmit={handleGate}
          className="w-full max-w-sm p-8 bg-card border border-border rounded-lg"
        >
          <Lock className="w-5 h-5 text-primary mb-4" />
          <h1 className="font-display text-2xl mb-1">ADMIN CONSOLE</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Enter the <code className="text-primary">ADMIN_TOKEN</code> secret. All writes go
            through the service-role <code className="text-primary">admin-serials</code> edge
            function — the public <code>weekly_serials</code> table stays locked.
          </p>
          <input
            type="password"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="Admin token"
            className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm mb-3 focus:outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="w-full px-4 py-2 bg-primary text-primary-foreground font-display tracking-widest text-sm rounded-sm hover:opacity-90"
          >
            UNLOCK
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-body pt-14">
      <SEO title="Admin Upload — NakeKnight" description="Restricted." path="/admin-upload" />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-primary font-display tracking-[0.3em] text-xs mb-2">CHRONICLES · ADMIN</p>
          <h1 className="font-display text-4xl md:text-5xl mb-2">EPISODE UPLOAD</h1>
          <p className="text-muted-foreground text-sm mb-10">
            Upload MP3 + transcript and publish a new chapter of the saga. All writes go
            through a service-role edge function authenticated by ADMIN_TOKEN.
          </p>
        </motion.div>

        <form
          onSubmit={handleSubmit}
          className="p-6 md:p-8 bg-card/60 border border-border rounded-lg space-y-5 mb-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="font-display text-[11px] tracking-widest text-muted-foreground">TITLE</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="The Hollow Crown"
                className="mt-1 w-full px-3 py-2 bg-background border border-border rounded-sm text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="font-display text-[11px] tracking-widest text-muted-foreground">EPISODE #</label>
              <input
                type="number"
                value={episodeNumber}
                onChange={(e) => setEpisodeNumber(parseInt(e.target.value) || 1)}
                className="mt-1 w-full px-3 py-2 bg-background border border-border rounded-sm text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="font-display text-[11px] tracking-widest text-muted-foreground">DESCRIPTION</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Short hook shown on the episode card."
              className="mt-1 w-full px-3 py-2 bg-background border border-border rounded-sm text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="font-display text-[11px] tracking-widest text-muted-foreground">TRANSCRIPT</label>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={8}
              placeholder="Full transcript (revealed under episode)."
              className="mt-1 w-full px-3 py-2 bg-background border border-border rounded-sm text-sm font-mono focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="font-display text-[11px] tracking-widest text-muted-foreground">AUDIO FILE (MP3)</label>
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="mt-1 w-full px-3 py-2 bg-background border border-border rounded-sm text-sm file:mr-3 file:py-1 file:px-3 file:rounded-sm file:border-0 file:bg-primary file:text-primary-foreground file:font-display file:text-xs file:tracking-widest"
              />
              {file && (
                <p className="text-[11px] text-muted-foreground mt-1">
                  {file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              )}
            </div>
            <div>
              <label className="font-display text-[11px] tracking-widest text-muted-foreground">RELEASE DATE</label>
              <input
                type="datetime-local"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
                className="mt-1 w-full px-3 py-2 bg-background border border-border rounded-sm text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="accent-primary"
              />
              <span>Publish immediately</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isPremium}
                onChange={(e) => setIsPremium(e.target.checked)}
                className="accent-primary"
              />
              <span>Premium-only episode</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-display tracking-widest text-sm rounded-sm hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {submitting ? progress || "WORKING…" : "SAVE EPISODE"}
          </button>
        </form>

        {/* AUTONOMOUS CHRONICLES ENGINE */}
        <div className="p-6 md:p-8 bg-card/60 border border-primary/40 rounded-lg space-y-4 mb-12">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <h2 className="font-display tracking-widest text-sm">AUTONOMOUS ENGINE</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Cron runs every Friday 04:00 UTC (midnight EST). Reads the Lore Bible + last 3 episodes,
            drafts a new episode via Gemini, runs a QA pass, then publishes. Idempotent per ISO week.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={runAutoWeekly}
              disabled={autoBusy}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-display tracking-widest text-xs rounded-sm hover:opacity-90 disabled:opacity-50"
            >
              {autoBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
              {autoBusy ? "GENERATING…" : "RUN WEEKLY NOW"}
            </button>
            <button
              onClick={loadLogs}
              className="inline-flex items-center gap-2 px-4 py-2 bg-background border border-border font-display tracking-widest text-xs rounded-sm hover:border-primary"
            >
              LOAD LOGS
            </button>
          </div>

          {autoLastResult && (
            <pre className="mt-2 p-3 bg-background border border-border rounded text-[10px] font-mono overflow-x-auto max-h-40">
              {JSON.stringify(autoLastResult, null, 2)}
            </pre>
          )}

          {logs.length > 0 && (
            <div className="mt-4">
              <p className="font-display text-[10px] tracking-widest text-muted-foreground mb-2">
                RECENT AUTOMATION LOGS
              </p>
              <div className="space-y-1 max-h-64 overflow-y-auto text-[11px] font-mono">
                {logs.map((l) => (
                  <div key={l.id} className="flex gap-2 py-1 border-b border-border/40">
                    <span className={
                      l.level === "error" ? "text-red-400" :
                      l.level === "warn" ? "text-yellow-400" : "text-muted-foreground"
                    }>
                      [{l.level}]
                    </span>
                    <span className="text-primary/80">{l.step}</span>
                    <span className="flex-1 truncate">{l.message}</span>
                    <span className="text-muted-foreground shrink-0">
                      {new Date(l.created_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {lore.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <ScrollText className="w-3.5 h-3.5 text-primary" />
                <p className="font-display text-[10px] tracking-widest text-muted-foreground">
                  LORE BIBLE ({lore.length})
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {lore.map((l) => (
                  <div key={l.id} className="p-2 bg-background border border-border rounded text-[11px]">
                    <div className="flex justify-between gap-2">
                      <span className="font-display tracking-wider text-primary">{l.name}</span>
                      <span className="text-muted-foreground text-[10px]">
                        {l.kind} · EP{l.first_seen_episode ?? "—"}
                      </span>
                    </div>
                    <p className="text-muted-foreground mt-1 line-clamp-2">{l.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>



        <div className="p-6 md:p-8 bg-card/60 border border-primary/30 rounded-lg space-y-4 mb-12">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h2 className="font-display tracking-widest text-sm">AI CONTENT FACTORY</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Text: Lovable AI (Gemini, free tier). Audio: any OpenAI-compatible TTS pointed at{" "}
            <code className="text-primary">CUSTOM_TTS_BASE_URL</code> — e.g. a Kokoro-FastAPI
            instance or HuggingFace Space exposing <code>/v1/audio/speech</code>. Episode # uses the
            value from the form above ({episodeNumber}).
          </p>
          <textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            rows={3}
            placeholder="A theme or brief. e.g. 'A rain-soaked Brooklyn rooftop. Knight finds a child's mask pinned to a fire-escape with a single gold coin.'"
            className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm focus:outline-none focus:border-primary"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="font-display text-[11px] tracking-widest text-muted-foreground">TTS VOICE</label>
              <input
                value={aiVoice}
                onChange={(e) => setAiVoice(e.target.value)}
                placeholder="af_bella"
                className="mt-1 w-full px-3 py-2 bg-background border border-border rounded-sm text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex items-end gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={aiAudio} onChange={(e) => setAiAudio(e.target.checked)} className="accent-primary" />
                <span>Generate audio</span>
              </label>
            </div>
            <div className="flex items-end gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={aiPublish} onChange={(e) => setAiPublish(e.target.checked)} className="accent-primary" />
                <span>Publish</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={aiPremium} onChange={(e) => setAiPremium(e.target.checked)} className="accent-primary" />
                <span>Premium</span>
              </label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="font-display text-[11px] tracking-widest text-muted-foreground">BATCH COUNT (1–8)</label>
              <input
                type="number"
                min={1}
                max={8}
                value={aiCount}
                onChange={(e) => setAiCount(Math.max(1, Math.min(8, parseInt(e.target.value) || 1)))}
                className="mt-1 w-full px-3 py-2 bg-background border border-border rounded-sm text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex items-end gap-4 text-sm md:col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={aiWeekly}
                  onChange={(e) => setAiWeekly(e.target.checked)}
                  disabled={aiCount < 2}
                  className="accent-primary"
                />
                <span>Stagger releases weekly (+7 days each)</span>
              </label>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={runAiGenerate}
              disabled={aiBusy}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-display tracking-widest text-sm rounded-sm hover:opacity-90 disabled:opacity-50"
            >
              {aiBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {aiBusy ? "GENERATING…" : aiCount > 1 ? `GENERATE ${aiCount}-EPISODE BATCH` : "GENERATE EPISODE"}
            </button>

            {lastShareText && (
              <button
                onClick={copyShareTemplate}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-card border border-primary/40 text-primary font-display tracking-widest text-sm rounded-sm hover:border-primary"
              >
                <Sparkles className="w-4 h-4" /> COPY PUBLISH & SHARE TEMPLATE
              </button>
            )}
          </div>

          {lastShareText && (
            <pre className="mt-2 p-3 bg-background/60 border border-border rounded-sm text-[11px] text-muted-foreground whitespace-pre-wrap font-mono">
              {lastShareText}
            </pre>
          )}
        </div>

        {promoAssets && (
          <div className="p-6 md:p-8 bg-card/60 border border-primary/40 rounded-lg space-y-4 mb-12">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h2 className="font-display tracking-widest text-sm">
                  PROMO ASSETS — EP {promoAssets.ep && String(promoAssets.ep.episode_number).padStart(2, "0")} · {promoAssets.ep?.title}
                </h2>
              </div>
              <button
                onClick={() => setPromoAssets(null)}
                className="text-xs font-display tracking-widest text-muted-foreground hover:text-primary"
              >
                CLOSE
              </button>
            </div>

            {promoAssets.x_thread && promoAssets.x_thread.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-display text-xs tracking-widest text-muted-foreground">X THREAD</p>
                  <button
                    onClick={() => copyText((promoAssets.x_thread ?? []).join("\n\n"), "X thread copied")}
                    className="text-[10px] font-display tracking-widest text-primary hover:opacity-80"
                  >
                    COPY ALL
                  </button>
                </div>
                <ol className="space-y-2 text-sm">
                  {promoAssets.x_thread.map((t, i) => (
                    <li key={i} className="p-3 bg-background/60 border border-border rounded-sm">
                      <span className="text-[10px] font-display tracking-widest text-primary mr-2">{i + 1}/{promoAssets.x_thread!.length}</span>
                      <span className="whitespace-pre-wrap">{t}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {promoAssets.reddit_post && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-display text-xs tracking-widest text-muted-foreground">REDDIT POST</p>
                  <button
                    onClick={() =>
                      copyText(
                        `${promoAssets.reddit_post!.title}\n\n${promoAssets.reddit_post!.body}`,
                        "Reddit post copied",
                      )
                    }
                    className="text-[10px] font-display tracking-widest text-primary hover:opacity-80"
                  >
                    COPY
                  </button>
                </div>
                <p className="text-sm font-medium mb-1">{promoAssets.reddit_post.title}</p>
                <pre className="p-3 bg-background/60 border border-border rounded-sm text-[12px] whitespace-pre-wrap font-mono text-muted-foreground">
                  {promoAssets.reddit_post.body}
                </pre>
              </div>
            )}

            {promoAssets.ig_caption && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-display text-xs tracking-widest text-muted-foreground">INSTAGRAM / TIKTOK CAPTION</p>
                  <button
                    onClick={() => copyText(promoAssets.ig_caption!, "Caption copied")}
                    className="text-[10px] font-display tracking-widest text-primary hover:opacity-80"
                  >
                    COPY
                  </button>
                </div>
                <pre className="p-3 bg-background/60 border border-border rounded-sm text-[12px] whitespace-pre-wrap font-mono text-muted-foreground">
                  {promoAssets.ig_caption}
                </pre>
              </div>
            )}

            {promoAssets.video_script && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-display text-xs tracking-widest text-muted-foreground">30-SEC VIDEO SCRIPT</p>
                  <button
                    onClick={() => copyText(promoAssets.video_script!, "Video script copied")}
                    className="text-[10px] font-display tracking-widest text-primary hover:opacity-80"
                  >
                    COPY
                  </button>
                </div>
                <pre className="p-3 bg-background/60 border border-border rounded-sm text-[12px] whitespace-pre-wrap font-mono text-muted-foreground">
                  {promoAssets.video_script}
                </pre>
              </div>
            )}
          </div>
        )}

        <h2 className="font-display text-xl mb-4 tracking-widest">EXISTING EPISODES</h2>
        {loading ? (
          <p className="text-muted-foreground text-sm">Loading…</p>
        ) : episodes.length === 0 ? (
          <p className="text-muted-foreground text-sm">No episodes yet.</p>
        ) : (
          <div className="space-y-2">
            {episodes.map((ep) => (
              <div
                key={ep.id}
                className="flex items-center justify-between gap-3 p-4 bg-card/40 border border-border rounded-sm"
              >
                <div className="min-w-0">
                  <p className="text-xs font-display tracking-widest text-primary">
                    EP {String(ep.episode_number).padStart(2, "0")}
                    {ep.is_premium ? " · PREMIUM" : ""}
                  </p>
                  <p className="text-sm font-medium truncate">{ep.title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(ep.release_date).toLocaleString()} ·{" "}
                    {ep.is_published ? (
                      <span className="text-primary">PUBLISHED</span>
                    ) : (
                      <span>DRAFT</span>
                    )}
                    {ep.audio_url ? " · audio ✓" : " · no audio"}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => generatePromo(ep)}
                    disabled={promoBusy === ep.id}
                    title="Generate promo assets"
                    className="px-2 py-1 text-[10px] font-display tracking-widest border border-primary/40 text-primary rounded-sm hover:bg-primary/10 disabled:opacity-50"
                  >
                    {promoBusy === ep.id ? "…" : "PROMO"}
                  </button>
                  <button
                    onClick={() => togglePremium(ep)}
                    title="Toggle premium"
                    className={`px-2 py-1 text-[10px] font-display tracking-widest border rounded-sm ${
                      ep.is_premium
                        ? "bg-primary/20 text-primary border-primary/40"
                        : "text-muted-foreground border-border hover:text-primary"
                    }`}
                  >
                    PREMIUM
                  </button>
                  <button
                    onClick={() => togglePublish(ep)}
                    title="Toggle publish"
                    className="p-2 text-muted-foreground hover:text-primary border border-border rounded-sm"
                  >
                    {ep.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => remove(ep)}
                    title="Delete"
                    className="p-2 text-muted-foreground hover:text-destructive border border-border rounded-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 p-6 bg-muted/30 border border-border rounded-lg text-sm leading-relaxed">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <h3 className="font-display tracking-widest">WEEKLY WORKFLOW</h3>
          </div>
          <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground">
            <li>Generate the MP3 + transcript with your AI pipeline.</li>
            <li>Open <code className="text-primary">/admin-upload</code> and paste your ADMIN_TOKEN.</li>
            <li>Fill in title, episode #, description, transcript, release date.</li>
            <li>Pick the MP3 — the edge function returns a signed upload URL, the file lands in the private <code className="text-primary">chronicles</code> bucket, and the public page streams it via short-lived signed URLs.</li>
            <li>Toggle <strong>Premium-only</strong> to gate it behind the Chronicles paywall.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
