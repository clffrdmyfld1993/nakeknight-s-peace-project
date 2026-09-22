import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  BadgeDollarSign,
  Loader2,
  Percent,
  Receipt,
  TrendingUp,
  Wallet,
} from "lucide-react";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const LOVABLE_PRO_USD = 25;

interface SkuRow {
  sku: string;
  units: number;
  grossCents: number;
  feeCents: number;
  netCents: number;
}

interface Stats {
  checkedAt: string;
  orders: number;
  grossCents: number;
  feeCents: number;
  netCents: number;
  refundedCents: number;
  feePct: number | null;
  aovCents: number;
  balance: { availableCents: number; pendingCents: number };
  activeProducts: number;
  bySku: SkuRow[];
  series: { date: string; net: number; cumulative: number }[];
  search: { impressions: number; clicks: number; ctr: number; position: number } | null;
}

const money = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

const pct = (v: number | null) => (v === null ? "—" : `${(v * 100).toFixed(1)}%`);

function Stat({
  icon: Icon,
  label,
  value,
  sub,
  tone = "default",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "good" | "bad";
}) {
  const toneClass =
    tone === "good" ? "text-primary" : tone === "bad" ? "text-destructive" : "text-foreground";
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 font-display text-[11px] tracking-widest text-muted-foreground">
          <Icon className="w-4 h-4" aria-hidden="true" />
          {label.toUpperCase()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`font-display text-3xl ${toneClass}`}>{value}</div>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

const PIE_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--primary) / 0.7)",
  "hsl(var(--primary) / 0.5)",
  "hsl(var(--primary) / 0.35)",
  "hsl(var(--muted-foreground) / 0.5)",
];

export default function Command() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("profit-stats");
        if (cancelled) return;
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        setStats(data as Stats);
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const s = stats;
  const orders = s?.orders ?? 0;
  const clicks = s?.search?.clicks ?? 0;
  const impressions = s?.search?.impressions ?? 0;

  // GA4 sessions are not readable from the app (the Data API needs separate
  // server credentials), so Search Console clicks stand in as the visit count
  // and every rate built on it is labelled as such. Never estimated.
  const visits = clicks;
  const conversion = visits > 0 ? orders / visits : null;
  const rpv = visits > 0 ? (s?.grossCents ?? 0) / 100 / visits : null;
  const runway = s ? (s.balance.availableCents + s.balance.pendingCents) / 100 / LOVABLE_PRO_USD : 0;

  const pieData = (s?.bySku ?? []).filter((r) => r.netCents > 0).map((r) => ({
    name: r.sku,
    value: Number((r.netCents / 100).toFixed(2)),
  }));

  const funnel = [
    { label: "GSC impressions", value: impressions },
    { label: "GSC clicks", value: clicks },
    { label: "Purchases", value: orders },
  ];

  return (
    <div className="min-h-screen bg-background font-body pt-14">
      <SEO
        title="NakeKnight Command — Net Payout & Conversion Dashboard"
        description="Live profitability for NakeKnight: net payout after Stripe fees, fee drag, AOV, revenue per visit and the search-to-purchase funnel. No simulated numbers."
        path="/command"
        noindex
      />
      <div className="max-w-6xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-primary font-display tracking-[0.3em]">PROFITABILITY COMMAND</p>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded px-1.5 py-0.5">
              <Activity className="w-3 h-3" aria-hidden="true" /> Live Stripe + Search Console
            </span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl text-foreground mb-3">
            NET PAYOUT, NOT GROSS
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Last 30 days. Fees come from the real Stripe balance transactions on
            each charge, so net payout is what actually lands in the bank. Zeros
            are real zeros.
          </p>
        </motion.div>

        {loading && (
          <div className="p-5 bg-card border border-border rounded-lg flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Reading live Stripe data…
          </div>
        )}

        {err && !loading && (
          <div className="p-5 bg-card border border-destructive/30 rounded-lg text-sm text-destructive">
            Live data unavailable: {err}
          </div>
        )}

        {s && !loading && (
          <>
            {orders === 0 && (
              <div className="mb-6 p-4 bg-card border border-primary/30 rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-sm text-muted-foreground">
                  <span className="font-display tracking-widest text-foreground text-xs block mb-1">
                    NO LIQUIDITY YET — FIX CTR FIRST
                  </span>
                  {impressions.toLocaleString()} impressions and {clicks.toLocaleString()} clicks in
                  the last 30 days produced $0. Clicks, not catalogue size, are the
                  bottleneck.
                </p>
              </div>
            )}

            {/* Top row */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
              <Stat
                icon={BadgeDollarSign}
                label="Gross revenue (30d)"
                value={money(s.grossCents)}
                sub={`${s.orders} paid order${s.orders === 1 ? "" : "s"}`}
              />
              <Stat
                icon={Wallet}
                label="Net payout (30d)"
                value={money(s.netCents)}
                tone="good"
                sub="This is the profit line — gross minus Stripe fees"
              />
              <Stat
                icon={Percent}
                label="Stripe fee drag"
                value={pct(s.feePct)}
                tone={s.feePct !== null && s.feePct > 0.06 ? "bad" : "good"}
                sub={`${money(s.feeCents)} in fees · target under 6%`}
              />
              <Stat
                icon={TrendingUp}
                label="Conversion rate"
                value={conversion === null ? "—" : `${(conversion * 100).toFixed(2)}%`}
                tone={conversion !== null && conversion >= 0.02 ? "good" : "bad"}
                sub="Orders ÷ Search Console clicks · target 2–4%"
              />
              <Stat
                icon={Receipt}
                label="AOV"
                value={money(s.aovCents)}
                sub="Gross ÷ orders"
              />
              <Stat
                icon={Activity}
                label="RPV / runway"
                value={rpv === null ? "—" : `$${rpv.toFixed(2)}`}
                sub={`Revenue per visit · Stripe balance covers ${runway.toFixed(1)} months of Lovable Pro`}
              />
            </div>

            {/* Cumulative net profit */}
            <section className="mb-10">
              <h2 className="font-display text-2xl text-foreground mb-4">CUMULATIVE NET PROFIT</h2>
              <div className="bg-card border border-border rounded-lg p-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={s.series}>
                    <defs>
                      <linearGradient id="netFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        fontSize: 12,
                      }}
                      formatter={(v: number) => [`$${v.toFixed(2)}`, "Cumulative net"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="cumulative"
                      stroke="hsl(var(--primary))"
                      fill="url(#netFill)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Net by SKU */}
            <section className="grid lg:grid-cols-2 gap-4 mb-10">
              <div className="bg-card border border-border rounded-lg p-4">
                <h2 className="font-display text-xl text-foreground mb-2">NET PROFIT BY SKU</h2>
                {pieData.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-16 text-center">
                    No paid orders in the window — nothing to split yet.
                  </p>
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} label>
                          {pieData.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            fontSize: 12,
                          }}
                          formatter={(v: number) => `$${v.toFixed(2)}`}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <h2 className="font-display text-xl text-foreground mb-2">SEARCH TO PURCHASE</h2>
                <ul className="space-y-2 mt-4">
                  {funnel.map((step, i) => {
                    const prev = i > 0 ? funnel[i - 1].value : null;
                    const drop = prev && prev > 0 ? 1 - step.value / prev : null;
                    const width = impressions > 0 ? Math.max(4, (step.value / impressions) * 100) : 4;
                    return (
                      <li key={step.label}>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span className="text-foreground">{step.label}</span>
                          <span>
                            {step.value.toLocaleString()}
                            {drop !== null && (
                              <span className="ml-2 text-destructive">
                                −{(drop * 100).toFixed(1)}%
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="h-3 bg-muted rounded-sm overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${width}%` }} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <p className="text-[11px] text-muted-foreground mt-4">
                  Search Console click-through rate: {s.search ? `${(s.search.ctr * 100).toFixed(2)}%` : "unavailable"}.
                  In-page steps (view_item → add_to_cart → begin_checkout) are being
                  collected in GA4 under G-28DS4V8XRT and are read there — this app
                  cannot query the GA4 reporting API without separate credentials, so
                  no estimate is shown here.
                </p>
              </div>
            </section>

            {/* SKU table */}
            <section className="mb-10">
              <h2 className="font-display text-2xl text-foreground mb-4">SKU PROFIT & LOSS</h2>
              <div className="bg-card border border-border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-right">Units</TableHead>
                      <TableHead className="text-right">Gross</TableHead>
                      <TableHead className="text-right">Fees</TableHead>
                      <TableHead className="text-right">Net</TableHead>
                      <TableHead className="text-right">Margin</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {s.bySku.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          No sales in the last 30 days.
                        </TableCell>
                      </TableRow>
                    )}
                    {s.bySku.map((r) => {
                      const margin = r.grossCents > 0 ? r.netCents / r.grossCents : 0;
                      const keep = r.units > 0 && margin >= 0.9;
                      return (
                        <TableRow key={r.sku}>
                          <TableCell className="font-mono text-xs">{r.sku}</TableCell>
                          <TableCell className="text-right">{r.units}</TableCell>
                          <TableCell className="text-right">{money(r.grossCents)}</TableCell>
                          <TableCell className="text-right text-destructive">
                            {money(r.feeCents)}
                          </TableCell>
                          <TableCell className="text-right text-primary">{money(r.netCents)}</TableCell>
                          <TableCell className="text-right">{(margin * 100).toFixed(1)}%</TableCell>
                          <TableCell className="text-right font-display text-xs tracking-widest">
                            {keep ? "KEEP" : "REVIEW"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </section>

            <p className="text-[11px] text-muted-foreground">
              Read live from Stripe and Search Console at{" "}
              {new Date(s.checkedAt).toLocaleString()}. {s.activeProducts} active Stripe products.
              Refunded in window: {money(s.refundedCents)}.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
