import { useCallback, useEffect, useRef, useState } from "react";
import { Activity, RefreshCw, ShieldCheck, AlertTriangle, MinusCircle } from "lucide-react";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const TOKEN_KEY = "nk_admin_token";

interface Check {
  name: string;
  status: "ok" | "degraded" | "skipped";
  detail: string;
  duration_ms: number;
}

interface HealthResult {
  status: "ok" | "degraded";
  checked_at: string;
  details: Check[];
}

const statusIcon = (s: Check["status"]) =>
  s === "ok" ? (
    <ShieldCheck className="w-4 h-4 text-primary" aria-hidden="true" />
  ) : s === "degraded" ? (
    <AlertTriangle className="w-4 h-4 text-destructive" aria-hidden="true" />
  ) : (
    <MinusCircle className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
  );

export default function AdminHealth() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) ?? "");
  const [unlocked, setUnlocked] = useState(() => !!localStorage.getItem(TOKEN_KEY));
  const [result, setResult] = useState<HealthResult | null>(null);
  const [loading, setLoading] = useState(false);
  const timer = useRef<number | null>(null);

  const run = useCallback(
    async (silent = false) => {
      const t = localStorage.getItem(TOKEN_KEY);
      if (!t) return;
      if (!silent) setLoading(true);
      const { data, error } = await supabase.functions.invoke("health-check", {
        headers: { "x-admin-token": t },
        body: {},
      });
      setLoading(false);
      if (error) {
        if (!silent) toast.error(error.message || "Health check failed");
        return;
      }
      setResult(data as HealthResult);
    },
    [],
  );

  useEffect(() => {
    if (!unlocked) return;
    run();
    timer.current = window.setInterval(() => run(true), 60_000);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [unlocked, run]);

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-background font-body pt-14 flex items-center justify-center px-6">
        <SEO title="Health Console | HeroDossier" description="Internal stack health console." path="/admin/health" noindex />
        <div className="w-full max-w-sm p-8 bg-card/60 border border-border rounded-lg">
          <h1 className="font-display text-2xl text-foreground mb-2">HEALTH CONSOLE</h1>
          <p className="text-sm text-muted-foreground mb-5">Enter the admin token to continue.</p>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            aria-label="Admin token"
            placeholder="admin token"
            className="w-full mb-3 px-3 py-2 bg-background border border-border rounded-sm text-sm text-foreground"
          />
          <button
            onClick={() => {
              if (!token.trim()) return;
              localStorage.setItem(TOKEN_KEY, token.trim());
              setUnlocked(true);
            }}
            className="w-full px-4 py-2 bg-primary text-primary-foreground font-display tracking-widest text-sm rounded-sm hover:opacity-90"
          >
            UNLOCK
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-body pt-14">
      <SEO title="Health Console | HeroDossier" description="Internal stack health console." path="/admin/health" noindex />
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <p className="font-display text-xs tracking-[0.3em] text-primary mb-2">SELF-HEALING OPS</p>
            <h1 className="font-display text-4xl text-foreground">Stack Health</h1>
          </div>
          <button
            onClick={() => run()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-sm font-display text-xs tracking-widest text-muted-foreground hover:text-primary hover:border-primary/40 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
            REFRESH
          </button>
        </div>

        {result && (
          <div
            className={`mb-6 p-5 rounded-lg border flex items-center gap-3 ${
              result.status === "ok" ? "border-primary/40 bg-primary/5" : "border-destructive/50 bg-destructive/5"
            }`}
          >
            <Activity className={`w-5 h-5 ${result.status === "ok" ? "text-primary" : "text-destructive"}`} aria-hidden="true" />
            <div>
              <p className="font-display tracking-widest text-sm text-foreground">
                {result.status === "ok" ? "ALL SYSTEMS NOMINAL" : "DEGRADED"}
              </p>
              <p className="text-xs text-muted-foreground">
                Checked {new Date(result.checked_at).toLocaleString()} — auto-refreshes every 60s
              </p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {(result?.details ?? []).map((c) => (
            <div
              key={c.name}
              className="flex items-center gap-3 p-4 bg-card/60 border border-border rounded-md"
            >
              {statusIcon(c.status)}
              <span className="font-display text-sm tracking-widest text-foreground w-48 shrink-0">
                {c.name.toUpperCase()}
              </span>
              <span className="text-sm text-muted-foreground flex-1">{c.detail}</span>
              <span className="text-xs text-muted-foreground tabular-nums">{c.duration_ms}ms</span>
            </div>
          ))}
          {!result && !loading && (
            <p className="text-sm text-muted-foreground">No results yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
