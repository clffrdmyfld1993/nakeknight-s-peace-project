import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw, DollarSign, Repeat, ShoppingCart, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import AdminGate from "@/components/AdminGate";

interface Stats {
  checkedAt: string;
  activeProducts: number;
  last14d: {
    grossCents: number;
    orders: number;
    aovCents: number;
    checkoutStarts: number;
    checkoutCompleted: number;
    series: Array<{ date: string; grossCents: number; orders: number }>;
  };
  recurring: { activeSubscriptions: number; mrrCents: number; arpaCents: number };
}

const usd = (cents: number) =>
  `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function Stat({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
}) {
  return (
    <div className="p-5 bg-card border border-border rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-primary" aria-hidden="true" />
        <p className="font-display text-[10px] tracking-[0.25em] text-muted-foreground">{label}</p>
      </div>
      <p className="font-display text-3xl text-foreground tabular-nums">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminCashflow() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-stats`;
      const res = await fetch(url, {
        headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || `HTTP ${res.status}`);
      setStats(json as Stats);
    } catch (e: any) {
      setError(e?.message || "Failed to load Stripe data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const s = stats;
  const conv =
    s && s.last14d.checkoutStarts > 0
      ? ((s.last14d.checkoutCompleted / s.last14d.checkoutStarts) * 100).toFixed(1)
      : "0.0";
  const weeklyProjection = s ? Math.round(s.last14d.grossCents / 2) + s.recurring.mrrCents / 4 : 0;

  return (
    <AdminGate
      title="Cashflow"
      description="14-day live cash dashboard: orders, AOV, checkout conversion, MRR, and projected weekly cash."
      path="/admin/cashflow"
    >
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
          <div>
            <p className="font-display tracking-[0.3em] text-xs text-primary mb-1">LIVE STRIPE DATA</p>
            <h1 className="font-display text-5xl text-foreground">CASHFLOW</h1>
            {s && (
              <p className="text-xs text-muted-foreground mt-2">
                Checked {new Date(s.checkedAt).toLocaleString()}
              </p>
            )}
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary font-display text-xs tracking-widest rounded-sm hover:bg-primary/20 disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            REFRESH
          </button>
        </div>

        {error && (
          <div className="p-4 mb-6 bg-destructive/10 border border-destructive/40 rounded-lg text-sm text-destructive">
            {error}
          </div>
        )}

        {s && (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <Stat label="CASH — 14 DAYS" value={usd(s.last14d.grossCents)} sub={`${s.last14d.orders} paid orders`} icon={DollarSign} />
              <Stat label="AOV" value={usd(s.last14d.aovCents)} sub="Average order value" icon={ShoppingCart} />
              <Stat
                label="CHECKOUT CONVERSION"
                value={`${conv}%`}
                sub={`${s.last14d.checkoutCompleted} of ${s.last14d.checkoutStarts} sessions`}
                icon={TrendingUp}
              />
              <Stat
                label="MRR"
                value={usd(s.recurring.mrrCents)}
                sub={`${s.recurring.activeSubscriptions} members · ARPA ${usd(s.recurring.arpaCents)}`}
                icon={Repeat}
              />
            </div>

            <div className="p-5 mb-8 bg-card border border-primary/30 rounded-lg">
              <p className="font-display text-[10px] tracking-[0.25em] text-muted-foreground mb-1">
                PROJECTED WEEKLY CASH
              </p>
              <p className="font-display text-4xl text-primary tabular-nums">{usd(weeklyProjection)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Trailing 14-day sales run rate ÷ 2, plus one week of current MRR. Real Stripe numbers only.
              </p>
            </div>

            <div className="p-5 bg-card border border-border rounded-lg">
              <h2 className="font-display text-xl text-foreground mb-4">DAILY GROSS — LAST 14 DAYS</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={s.last14d.series.map((d) => ({ ...d, gross: d.grossCents / 100 }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => String(v).slice(5)} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 6,
                        color: "hsl(var(--foreground))",
                      }}
                      formatter={(v: number) => [`$${Number(v).toFixed(2)}`, "Gross"]}
                    />
                    <Area type="monotone" dataKey="gross" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {loading && !s && (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading live Stripe data…
          </div>
        )}
      </div>
    </AdminGate>
  );
}
