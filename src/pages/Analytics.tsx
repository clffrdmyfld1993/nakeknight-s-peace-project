import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { MousePointerClick, Eye, Percent, TrendingUp, RefreshCw, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";

interface Row {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface ApiResponse {
  startDate: string;
  endDate: string;
  dimensions: string[];
  rows: Row[];
}

const RANGES = [
  { label: "7 days", days: 7 },
  { label: "28 days", days: 28 },
  { label: "90 days", days: 90 },
];

function isoDaysAgo(days: number) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

function fmtNum(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

export default function Analytics() {
  const [days, setDays] = useState(28);
  const [byDate, setByDate] = useState<ApiResponse | null>(null);
  const [byQuery, setByQuery] = useState<ApiResponse | null>(null);
  const [byPage, setByPage] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const startDate = isoDaysAgo(days);
      const endDate = isoDaysAgo(1);
      const common = { startDate, endDate };
      const [d, q, p] = await Promise.all([
        supabase.functions.invoke("gsc-analytics", { body: { ...common, dimensions: ["date"] } }),
        supabase.functions.invoke("gsc-analytics", { body: { ...common, dimensions: ["query"], rowLimit: 25 } }),
        supabase.functions.invoke("gsc-analytics", { body: { ...common, dimensions: ["page"], rowLimit: 25 } }),
      ]);
      if (d.error) throw new Error(d.error.message);
      if (q.error) throw new Error(q.error.message);
      if (p.error) throw new Error(p.error.message);
      setByDate(d.data as ApiResponse);
      setByQuery(q.data as ApiResponse);
      setByPage(p.data as ApiResponse);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  const totals = useMemo(() => {
    const rows = byDate?.rows ?? [];
    const clicks = rows.reduce((s, r) => s + r.clicks, 0);
    const impressions = rows.reduce((s, r) => s + r.impressions, 0);
    const ctr = impressions > 0 ? clicks / impressions : 0;
    const position = rows.length > 0 ? rows.reduce((s, r) => s + r.position, 0) / rows.length : 0;
    return { clicks, impressions, ctr, position };
  }, [byDate]);

  const chartData = useMemo(
    () =>
      (byDate?.rows ?? []).map((r) => ({
        date: r.keys[0],
        clicks: r.clicks,
        impressions: r.impressions,
        ctr: +(r.ctr * 100).toFixed(2),
        position: +r.position.toFixed(1),
      })),
    [byDate],
  );

  const stats = [
    { label: "Clicks", value: fmtNum(totals.clicks), icon: MousePointerClick },
    { label: "Impressions", value: fmtNum(totals.impressions), icon: Eye },
    { label: "CTR", value: `${(totals.ctr * 100).toFixed(2)}%`, icon: Percent },
    { label: "Avg. Position", value: totals.position ? totals.position.toFixed(1) : "—", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-background font-body pt-14">
      <SEO
        title="Search Analytics — NakeKnight™ Command"
        description="Live Google Search Console performance for the NakeKnight dossier: clicks, impressions, CTR, and average position."
        path="/analytics"
        noindex
      />

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-primary font-display tracking-[0.3em] mb-2">COMMAND // INTEL</p>
            <h1 className="font-display text-5xl md:text-6xl text-foreground">SEARCH ANALYTICS</h1>
            <p className="text-muted-foreground mt-2">
              Pulled live from Google Search Console for{" "}
              <span className="text-foreground">herodossier.lovable.app</span>.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-sm border border-border overflow-hidden">
              {RANGES.map((r) => (
                <button
                  key={r.days}
                  onClick={() => setDays(r.days)}
                  className={`px-3 py-1.5 font-display text-xs tracking-widest transition-colors ${
                    days === r.days
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <button
              onClick={load}
              disabled={loading}
              aria-label="Refresh analytics"
              className="p-2 rounded-sm border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-8 flex items-start gap-3 p-4 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <p className="font-display tracking-wider text-sm">DATA UNAVAILABLE</p>
              <p className="text-sm opacity-90">{error}</p>
            </div>
          </div>
        )}

        {/* Stat tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-5 bg-card border border-border rounded-lg"
            >
              <s.icon className="w-4 h-4 text-primary mb-3" aria-hidden="true" />
              <div className="font-display text-3xl text-foreground">{loading ? "—" : s.value}</div>
              <div className="text-xs text-muted-foreground tracking-widest mt-1">{s.label.toUpperCase()}</div>
            </motion.div>
          ))}
        </div>

        {/* Chart */}
        <div className="p-5 bg-card border border-border rounded-lg mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl text-foreground tracking-wider">CLICKS & IMPRESSIONS</h2>
            <span className="text-xs text-muted-foreground">
              {byDate ? `${byDate.startDate} → ${byDate.endDate}` : ""}
            </span>
          </div>
          <div className="h-72">
            {chartData.length === 0 && !loading ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                No data for this range yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gImps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickFormatter={(v: string) => v.slice(5)}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 6,
                      fontSize: 12,
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="impressions"
                    stroke="hsl(var(--muted-foreground))"
                    fill="url(#gImps)"
                    strokeWidth={1.5}
                  />
                  <Area
                    type="monotone"
                    dataKey="clicks"
                    stroke="hsl(var(--primary))"
                    fill="url(#gClicks)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top queries / pages */}
        <div className="grid md:grid-cols-2 gap-6">
          <TopList title="TOP QUERIES" rows={byQuery?.rows ?? []} loading={loading} />
          <TopList title="TOP PAGES" rows={byPage?.rows ?? []} loading={loading} truncate />
        </div>
      </div>
    </div>
  );
}

function TopList({ title, rows, loading, truncate }: { title: string; rows: Row[]; loading: boolean; truncate?: boolean }) {
  return (
    <div className="p-5 bg-card border border-border rounded-lg">
      <h2 className="font-display text-xl text-foreground tracking-wider mb-4">{title}</h2>
      {loading && rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No data yet.</p>
      ) : (
        <div className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground tracking-widest border-b border-border">
                <th className="text-left py-2 font-display font-normal">KEY</th>
                <th className="text-right py-2 font-display font-normal">CLICKS</th>
                <th className="text-right py-2 font-display font-normal">IMPR.</th>
                <th className="text-right py-2 font-display font-normal">POS.</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 10).map((r) => (
                <tr key={r.keys[0]} className="border-b border-border/50 last:border-0">
                  <td className={`py-2 pr-2 text-foreground ${truncate ? "max-w-[260px] truncate" : ""}`} title={r.keys[0]}>
                    {truncate ? r.keys[0].replace(/^https?:\/\/[^/]+/, "") || "/" : r.keys[0]}
                  </td>
                  <td className="py-2 text-right text-foreground">{r.clicks}</td>
                  <td className="py-2 text-right text-muted-foreground">{r.impressions}</td>
                  <td className="py-2 text-right text-muted-foreground">{r.position.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
