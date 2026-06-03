import { useState } from "react";
import { z } from "zod";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(254),
});

interface LeadCaptureProps {
  source: string;
  magnet?: string;
  buttonLabel?: string;
  placeholder?: string;
  successMessage?: string;
  compact?: boolean;
}

export default function LeadCapture({
  source,
  magnet = "AI Builder Blueprint",
  buttonLabel = "GET IT FREE",
  placeholder = "your@email.com",
  successMessage = "Check your inbox — your blueprint is on the way.",
  compact = false,
}: LeadCaptureProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      const referral =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("ref")
          : null;
      const { error } = await supabase.from("leads").insert({
        email: parsed.data.email.toLowerCase(),
        source,
        magnet,
        referral_code: referral,
        user_agent:
          typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 500) : null,
      });
      if (error) throw error;
      setDone(true);
      toast.success(successMessage);
      if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
        (window as any).gtag("event", "generate_lead", {
          send_to: "G-28DS4V8XRT",
          source,
          magnet,
        });
      }
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="flex items-center gap-2 text-primary font-display text-sm">
        <CheckCircle2 className="w-5 h-5" />
        {successMessage}
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className={
        compact
          ? "flex flex-col sm:flex-row gap-2 w-full max-w-md"
          : "flex flex-col sm:flex-row gap-3 w-full max-w-lg"
      }
    >
      <div className="relative flex-1">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-3 py-2.5 bg-card border border-border rounded-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-display text-sm tracking-wider rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-60"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {buttonLabel}
      </button>
    </form>
  );
}
