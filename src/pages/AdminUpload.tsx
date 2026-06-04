import { useEffect, useState } from "react";
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
}

const GATE_KEY = "nk_admin_gate";

export default function AdminUpload() {
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState("");
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
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState("");

  useEffect(() => {
    if (sessionStorage.getItem(GATE_KEY) === "1") setAuthed(true);
  }, []);

  useEffect(() => {
    if (authed) refresh();
  }, [authed]);

  const refresh = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("weekly_serials")
      .select("*")
      .order("episode_number", { ascending: false });
    setEpisodes((data as Serial[]) || []);
    // Suggest next episode number
    if (data && data.length > 0) {
      setEpisodeNumber(Math.max(...data.map((d) => d.episode_number)) + 1);
    }
    setLoading(false);
  };

  const handleGate = (e: React.FormEvent) => {
    e.preventDefault();
    // Soft gate — table writes still require service role / SQL,
    // so this is just to hide the UI from casual visitors.
    if (pass.trim().length >= 4) {
      sessionStorage.setItem(GATE_KEY, "1");
      setAuthed(true);
    } else {
      toast({ title: "Invalid passphrase", variant: "destructive" });
    }
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
        setProgress("Uploading audio to storage…");
        const ext = file.name.split(".").pop() || "mp3";
        const safe = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
        const path = `ep-${String(episodeNumber).padStart(2, "0")}-${safe}-${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("chronicles")
          .upload(path, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type || "audio/mpeg",
          });
        if (upErr) throw upErr;
        audioPath = path;
      }

      setProgress("Saving episode row…");
      const { error: insErr } = await supabase.from("weekly_serials").insert({
        title: title.trim(),
        episode_number: episodeNumber,
        description: description.trim() || null,
        transcript_text: transcript.trim() || null,
        audio_url: audioPath,
        release_date: new Date(releaseDate).toISOString(),
        is_published: isPublished,
      });
      if (insErr) throw insErr;

      toast({ title: "Episode saved", description: `EP ${episodeNumber} — ${title}` });
      setTitle("");
      setDescription("");
      setTranscript("");
      setFile(null);
      await refresh();
    } catch (err: any) {
      toast({
        title: "Upload failed",
        description: err?.message || "Check RLS policies — inserts may be blocked.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
      setProgress("");
    }
  };

  const togglePublish = async (ep: Serial) => {
    const { error } = await supabase
      .from("weekly_serials")
      .update({ is_published: !ep.is_published })
      .eq("id", ep.id);
    if (error) {
      toast({ title: "Update blocked", description: error.message, variant: "destructive" });
    } else {
      refresh();
    }
  };

  const remove = async (ep: Serial) => {
    if (!confirm(`Delete EP ${ep.episode_number} — ${ep.title}?`)) return;
    if (ep.audio_url && !ep.audio_url.startsWith("http")) {
      await supabase.storage.from("chronicles").remove([ep.audio_url]);
    }
    const { error } = await supabase.from("weekly_serials").delete().eq("id", ep.id);
    if (error) {
      toast({ title: "Delete blocked", description: error.message, variant: "destructive" });
    } else {
      refresh();
    }
  };

  if (!authed) {
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
            Soft-gated. Enter any passphrase (≥4 chars) to reveal the upload UI.
          </p>
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="Passphrase"
            className="w-full px-3 py-2 bg-background border border-border rounded-sm text-sm mb-3 focus:outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="w-full px-4 py-2 bg-primary text-primary-foreground font-display tracking-widest text-sm rounded-sm hover:opacity-90"
          >
            UNLOCK
          </button>
          <p className="text-[11px] text-muted-foreground mt-4 leading-relaxed">
            Note: real write protection lives in database RLS — this gate only hides the form. To
            allow writes from this page, you must add INSERT/UPDATE/DELETE policies on
            <code className="text-primary"> weekly_serials</code> or call from a service-role edge
            function.
          </p>
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
            Upload MP3 + transcript and publish a new chapter of the saga.
          </p>
        </motion.div>

        {/* Form */}
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

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="accent-primary"
            />
            <span>Publish immediately</span>
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-display tracking-widest text-sm rounded-sm hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {submitting ? progress || "WORKING…" : "SAVE EPISODE"}
          </button>
        </form>

        {/* Existing episodes */}
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
                <div className="flex items-center gap-2">
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

        {/* Instructions */}
        <div className="mt-12 p-6 bg-muted/30 border border-border rounded-lg text-sm leading-relaxed">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <h3 className="font-display tracking-widest">WEEKLY WORKFLOW</h3>
          </div>
          <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground">
            <li>Generate your MP3 + transcript with your AI pipeline.</li>
            <li>Open <code className="text-primary">/admin-upload</code> and unlock the console.</li>
            <li>Fill in title, episode number, description, transcript, and release date.</li>
            <li>Pick the MP3 — it uploads to the private <code className="text-primary">chronicles</code> bucket and the public page streams it via signed URLs.</li>
            <li>Toggle <strong>Publish immediately</strong> off if you want it to drop on schedule via the release date.</li>
          </ol>
          <p className="text-[11px] text-muted-foreground mt-4">
            If saving fails with a permissions error, the <code>weekly_serials</code> table has no public write policies (by design). Either run inserts via SQL / a service-role edge function, or add a temporary admin policy.
          </p>
        </div>
      </div>
    </div>
  );
}
