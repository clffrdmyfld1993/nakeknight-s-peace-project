import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import AdminGate, { getAdminToken } from "@/components/AdminGate";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EpisodeStat {
  id: string;
  title: string;
  episode_number: number;
  is_published: boolean;
  is_premium: boolean;
  plays: number;
}

interface AnalyticsData {
  episodes: EpisodeStat[];
  totals: {
    plays: number;
    plays_this_week: number;
    shares: number;
    leads: number;
    license_inquiries: number;
    episodes_published: number;
  };
  ref_breakdown: { ref: string; count: number }[];
  share_networks: { network: string; count: number }[];
  lead_sources: { source: string; count: number }[];
}

export default function AdminAnalytics() {
  return (
    <AdminGate
      title="Content Analytics"
      description="Internal analytics console: episode plays, referral sources, shares and leads."
      path="/admin/analytics"
    >
      <AnalyticsConsole />
    </AdminGate>
  );
}

function AnalyticsConsole() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = getAdminToken();
      const { data: res, error } = await supabase.functions.invoke("admin-serials", {
        headers: { "x-admin-token": token ?? "" },
        body: { action: "analytics" },
      });
      if (error) throw new Error(error.message);
      setData(res as AnalyticsData);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const t = data?.totals;
  const topPlays = [...(data?.episodes ?? [])].sort((a, b) => b.plays - a.plays).slice(0, 15);

  return (
    <>
      <header className="flex items-center justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="font-display text-3xl text-foreground">CONTENT ANALYTICS</h1>
          <p className="text-sm text-muted-foreground">
            First-party engagement data from the Chronicles engine.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded-sm text-sm text-foreground"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Refresh
        </button>
      </header>

      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6 mb-10">
        {[
          ["Plays", t?.plays],
          ["Plays / 7d", t?.plays_this_week],
          ["Shares", t?.shares],
          ["Leads", t?.leads],
          ["Inquiries", t?.license_inquiries],
          ["Published", t?.episodes_published],
        ].map(([label, value]) => (
          <div key={label as string} className="p-4 bg-card/60 border border-border rounded-lg">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
            <p className="font-display text-2xl text-foreground">{value ?? "—"}</p>
          </div>
        ))}
      </div>

      <section className="mb-10">
        <h2 className="font-display text-lg text-foreground mb-3">TOP EPISODES BY PLAYS</h2>
        <div className="overflow-x-auto border border-border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-card/60 text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-display">EP</th>
                <th className="text-left px-4 py-3 font-display">TITLE</th>
                <th className="text-left px-4 py-3 font-display">TIER</th>
                <th className="text-right px-4 py-3 font-display">PLAYS</th>
              </tr>
            </thead>
            <tbody>
              {topPlays.map((e) => (
                <tr key={e.id} className="border-t border-border">
                  <td className="px-4 py-3 text-muted-foreground">{e.episode_number}</td>
                  <td className="px-4 py-3 text-foreground">{e.title}</td>
                  <td className="px-4 py-3 text-primary">{e.is_premium ? "premium" : "free"}</td>
                  <td className="px-4 py-3 text-right text-foreground">{e.plays}</td>
                </tr>
              ))}
              {topPlays.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    No play data yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="TOP REFERRERS" rows={(data?.ref_breakdown ?? []).map((r) => [r.ref, r.count])} />
        <Panel
          title="SHARE NETWORKS"
          rows={(data?.share_networks ?? []).map((r) => [r.network, r.count])}
        />
        <Panel title="LEAD SOURCES" rows={(data?.lead_sources ?? []).map((r) => [r.source, r.count])} />
      </div>
    </>
  );
}

function Panel({ title, rows }: { title: string; rows: [string, number][] }) {
  return (
    <section className="border border-border rounded-lg overflow-hidden">
      <h2 className="font-display text-sm text-foreground px-4 py-3 bg-card/60">{title}</h2>
      <ul className="divide-y divide-border">
        {rows.map(([label, count]) => (
          <li key={label} className="flex justify-between px-4 py-2 text-sm">
            <span className="text-muted-foreground truncate mr-3">{label}</span>
            <span className="text-foreground">{count}</span>
          </li>
        ))}
        {rows.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-muted-foreground">No data yet.</li>
        )}
      </ul>
    </section>
  );
}
