import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, XCircle, MinusCircle, RefreshCw, AlertCircle, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";

interface InspectionResult {
  url: string;
  verdict: string;
  coverageState: string;
  indexingState: string;
  lastCrawlTime?: string;
  pageFetchState?: string;
  robotsTxtState?: string;
  googleCanonical?: string;
  userCanonical?: string;
  error?: string;
}

interface CoverageResponse {
  siteUrl: string;
  checkedAt: string;
  summary: { total: number; valid: number; partial: number; invalid: number; neutral: number; error: number };
  issues: Record<string, number>;
  results: InspectionResult[];
}

function verdictMeta(v: string) {
  switch (v) {
    case "PASS":
      return { label: "Valid", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", ring: "ring-emerald-500/30" };
    case "PARTIAL":
      return { label: "Valid w/ warnings", icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10", ring: "ring-amber-500/30" };
    case "FAIL":
      return { label: "Invalid", icon: XCircle, color: "text-red-500", bg: "bg-red-500/10", ring: "ring-red-500/30" };
    case "NEUTRAL":
      return { label: "Excluded", icon: MinusCircle, color: "text-muted-foreground", bg: "bg-muted/30", ring: "ring-muted/40" };
    default:
      return { label: "Error", icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10", ring: "ring-red-500/30" };
  }
}

export default function Coverage() {
  const [data, setData] = useState<CoverageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await supabase.functions.invoke("gsc-coverage", { body: {} });
      if (res.error) throw new Error(res.error.message);
      setData(res.data as CoverageResponse);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load coverage");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const s = data?.summary;

  return (
    <main className="min-h-screen bg-background pt-20 pb-16">
      <SEO
        title="Index Coverage — NakeKnight™"
        description="Google Search Console index coverage: valid, invalid and excluded pages with per-URL status."
        path="/coverage"
        noindex
      />

      <div className="max-w-6xl mx-auto px-6">
        <header className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-4xl md:text-5xl tracking-wider text-primary">COVERAGE</h1>
            <p className="text-muted-foreground mt-1">
              Index status from Google Search Console
              {data?.checkedAt && ` · checked ${new Date(data.checkedAt).toLocaleString()}`}
            </p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-sm border border-border hover:bg-muted/40 disabled:opacity-50 font-display text-sm tracking-widest"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            REFRESH
          </button>
        </header>

        {error && (
          <div className="mb-6 p-4 rounded-sm border border-red-500/40 bg-red-500/10 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-500">Could not load coverage</p>
              <p className="text-muted-foreground mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Summary tiles */}
        <section className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {[
            { key: "total", label: "Total", color: "text-foreground" },
            { key: "valid", label: "Valid", color: "text-emerald-500" },
            { key: "partial", label: "Warnings", color: "text-amber-500" },
            { key: "invalid", label: "Invalid", color: "text-red-500" },
            { key: "neutral", label: "Excluded", color: "text-muted-foreground" },
          ].map((tile) => (
            <motion.div
              key={tile.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-sm border border-border bg-card"
            >
              <p className="text-xs tracking-widest text-muted-foreground font-display">{tile.label.toUpperCase()}</p>
              <p className={`text-3xl font-display mt-1 ${tile.color}`}>
                {loading ? "—" : (s?.[tile.key as keyof typeof s] ?? 0)}
              </p>
            </motion.div>
          ))}
        </section>

        {/* Issue breakdown */}
        {data && Object.keys(data.issues).length > 0 && (
          <section className="mb-8">
            <h2 className="font-display text-xs tracking-widest text-muted-foreground mb-3">COVERAGE ISSUES</h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(data.issues)
                .sort((a, b) => b[1] - a[1])
                .map(([state, count]) => (
                  <span
                    key={state}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm border border-border bg-card text-sm"
                  >
                    <span className="text-foreground">{state}</span>
                    <span className="text-muted-foreground">×{count}</span>
                  </span>
                ))}
            </div>
          </section>
        )}

        {/* Per-URL table */}
        <section>
          <h2 className="font-display text-xs tracking-widest text-muted-foreground mb-3">PAGES</h2>
          <div className="rounded-sm border border-border overflow-hidden">
            <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-muted/30 text-xs tracking-widest font-display text-muted-foreground">
              <div className="col-span-5">URL</div>
              <div className="col-span-2">STATUS</div>
              <div className="col-span-3">COVERAGE STATE</div>
              <div className="col-span-2">LAST CRAWL</div>
            </div>
            {loading && !data && (
              <div className="px-4 py-8 text-center text-muted-foreground text-sm">Inspecting URLs…</div>
            )}
            {data?.results.map((r) => {
              const m = verdictMeta(r.verdict);
              const Icon = m.icon;
              const path = (() => {
                try {
                  return new URL(r.url).pathname;
                } catch {
                  return r.url;
                }
              })();
              return (
                <div
                  key={r.url}
                  className="grid grid-cols-12 gap-2 px-4 py-3 border-t border-border items-center text-sm"
                >
                  <div className="col-span-5 truncate">
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-foreground hover:text-primary"
                    >
                      <span className="truncate">{path}</span>
                      <ExternalLink className="w-3 h-3 shrink-0 opacity-60" aria-hidden="true" />
                    </a>
                  </div>
                  <div className="col-span-2">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-sm ring-1 ${m.bg} ${m.ring} ${m.color} text-xs font-medium`}>
                      <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                      {m.label}
                    </span>
                  </div>
                  <div className="col-span-3 text-muted-foreground truncate" title={r.coverageState}>
                    {r.error ? <span className="text-red-500">{r.error}</span> : r.coverageState}
                  </div>
                  <div className="col-span-2 text-muted-foreground text-xs">
                    {r.lastCrawlTime ? new Date(r.lastCrawlTime).toLocaleDateString() : "—"}
                  </div>
                </div>
              );
            })}
            {data && data.results.length === 0 && (
              <div className="px-4 py-8 text-center text-muted-foreground text-sm">No URLs in sitemap.</div>
            )}
          </div>
        </section>

        <p className="text-xs text-muted-foreground mt-6">
          Data comes from Google's URL Inspection API. Results lag actual crawls by a few minutes to days.
        </p>
      </div>
    </main>
  );
}
