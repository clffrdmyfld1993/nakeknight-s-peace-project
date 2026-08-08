import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Info, Loader2, PlayCircle, RefreshCw, TriangleAlert } from "lucide-react";
import AdminGate, { getAdminToken } from "@/components/AdminGate";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LogRow {
  id: string;
  run_id: string;
  step: string;
  level: "info" | "warn" | "error";
  message: string;
  context: unknown;
  created_at: string;
}

const LEVELS = ["all", "info", "warn", "error"] as const;

export default function AdminAutomation() {
  return (
    <AdminGate
      title="Automation"
      description="Internal automation console for the weekly Chronicles engine."
      path="/admin/automation"
    >
      <AutomationConsole />
    </AdminGate>
  );
}

function AutomationConsole() {
  const [rows, setRows] = useState<LogRow[]>([]);
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("all");
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = getAdminToken();
      const { data, error } = await supabase.functions.invoke("admin-serials", {
        headers: { "x-admin-token": token ?? "" },
        body: { action: "logs_list", limit: 300, ...(level === "all" ? {} : { level }) },
      });
      if (error) throw new Error(error.message);
      setRows(((data as { rows: LogRow[] }).rows ?? []) as LogRow[]);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [level]);

  useEffect(() => {
    load();
    const t = window.setInterval(load, 60_000);
    return () => window.clearInterval(t);
  }, [load]);

  const runNow = async () => {
    setRunning(true);
    try {
      const token = getAdminToken();
      const { error } = await supabase.functions.invoke("auto-publish-weekly", {
        headers: { "x-admin-token": token ?? "" },
        body: { triggered_by: "admin_console" },
      });
      if (error) throw new Error(error.message);
      toast.success("Weekly run triggered");
      setTimeout(load, 3000);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setRunning(false);
    }
  };

  const runs = Array.from(new Set(rows.map((r) => r.run_id)));
  const errorCount = rows.filter((r) => r.level === "error").length;

  const icon = (l: LogRow["level"]) =>
    l === "error" ? (
      <AlertTriangle className="w-4 h-4 text-destructive" aria-hidden="true" />
    ) : l === "warn" ? (
      <TriangleAlert className="w-4 h-4 text-primary" aria-hidden="true" />
    ) : (
      <Info className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
    );

  return (
    <>
      <header className="flex items-center justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="font-display text-3xl text-foreground">AUTOMATION</h1>
          <p className="text-sm text-muted-foreground">
            Weekly engine fires Fridays 00:00 EST via scheduled job. {runs.length} runs logged,{" "}
            {errorCount} errors.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            aria-label="Log level"
            value={level}
            onChange={(e) => setLevel(e.target.value as (typeof LEVELS)[number])}
            className="px-3 py-2 bg-background border border-border rounded-sm text-sm text-foreground"
          >
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded-sm text-sm text-foreground"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Refresh
          </button>
          <button
            type="button"
            onClick={runNow}
            disabled={running}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-sm font-display text-sm disabled:opacity-50"
          >
            {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
            RUN NOW
          </button>
        </div>
      </header>

      <div className="space-y-6">
        {runs.map((runId) => {
          const runRows = rows.filter((r) => r.run_id === runId);
          const failed = runRows.some((r) => r.level === "error");
          return (
            <section key={runId} className="border border-border rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-card/60">
                <span className="font-mono text-xs text-muted-foreground">{runId}</span>
                <span
                  className={`font-display text-xs ${failed ? "text-destructive" : "text-primary"}`}
                >
                  {failed ? "FAILED" : "OK"} · {runRows.length} steps
                </span>
              </div>
              <ul className="divide-y divide-border">
                {runRows.map((r) => (
                  <li key={r.id} className="flex gap-3 px-4 py-3 text-sm">
                    <span className="pt-0.5">{icon(r.level)}</span>
                    <div className="min-w-0">
                      <p className="text-foreground">
                        <span className="font-display text-xs text-primary mr-2">{r.step}</span>
                        {r.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
        {runs.length === 0 && !loading && (
          <p className="text-center text-muted-foreground py-12">
            No automation runs logged yet. Trigger one with RUN NOW.
          </p>
        )}
      </div>
    </>
  );
}
