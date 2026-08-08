import { useCallback, useEffect, useState } from "react";
import { Download, Loader2, Plus, RefreshCw, Trash2 } from "lucide-react";
import AdminGate, { getAdminToken } from "@/components/AdminGate";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LoreRow {
  id: string;
  kind: string;
  name: string;
  summary: string;
  first_seen_episode: number | null;
  created_at: string;
  updated_at: string;
}

const KINDS = ["character", "place", "artifact", "theme"] as const;

export default function AdminLore() {
  return (
    <AdminGate
      title="Lore Bible"
      description="Internal lore bible editor for the Chronicles continuity engine."
      path="/admin/lore"
    >
      <LoreConsole />
    </AdminGate>
  );
}

function LoreConsole() {
  const [rows, setRows] = useState<LoreRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState({
    kind: "character" as (typeof KINDS)[number],
    name: "",
    summary: "",
    first_seen_episode: "",
  });

  const call = useCallback(async (body: Record<string, unknown>) => {
    const token = getAdminToken();
    const { data, error } = await supabase.functions.invoke("admin-serials", {
      headers: { "x-admin-token": token ?? "" },
      body,
    });
    if (error) throw new Error(error.message);
    return data as Record<string, unknown>;
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await call({ action: "lore_list" });
      setRows((data.rows as LoreRow[]) ?? []);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [call]);

  useEffect(() => {
    load();
  }, [load]);

  const create = async () => {
    if (!draft.name.trim() || !draft.summary.trim()) {
      toast.error("Name and summary are required");
      return;
    }
    setSaving(true);
    try {
      await call({
        action: "lore_create",
        data: {
          kind: draft.kind,
          name: draft.name.trim(),
          summary: draft.summary.trim(),
          first_seen_episode: draft.first_seen_episode
            ? Number(draft.first_seen_episode)
            : null,
        },
      });
      setDraft({ kind: "character", name: "", summary: "", first_seen_episode: "" });
      toast.success("Lore entry added");
      load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await call({ action: "lore_delete", id });
      setRows((r) => r.filter((x) => x.id !== id));
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lore-bible-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <header className="flex items-center justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="font-display text-3xl text-foreground">LORE BIBLE</h1>
          <p className="text-sm text-muted-foreground">
            Continuity memory injected into every generated episode. {rows.length} entries.
          </p>
        </div>
        <div className="flex gap-2">
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
            onClick={exportJson}
            disabled={rows.length === 0}
            className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded-sm text-sm text-foreground disabled:opacity-50"
          >
            <Download className="w-4 h-4" aria-hidden="true" /> Export JSON
          </button>
        </div>
      </header>

      <section className="mb-10 p-5 bg-card/60 border border-border rounded-lg">
        <h2 className="font-display text-lg text-foreground mb-4">ADD ENTRY</h2>
        <div className="grid gap-3 md:grid-cols-4">
          <select
            aria-label="Kind"
            value={draft.kind}
            onChange={(e) => setDraft({ ...draft, kind: e.target.value as (typeof KINDS)[number] })}
            className="px-3 py-2 bg-background border border-border rounded-sm text-sm text-foreground"
          >
            {KINDS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
          <input
            aria-label="Name"
            placeholder="Name"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            className="px-3 py-2 bg-background border border-border rounded-sm text-sm text-foreground md:col-span-2"
          />
          <input
            aria-label="First seen episode"
            placeholder="First ep #"
            inputMode="numeric"
            value={draft.first_seen_episode}
            onChange={(e) => setDraft({ ...draft, first_seen_episode: e.target.value })}
            className="px-3 py-2 bg-background border border-border rounded-sm text-sm text-foreground"
          />
          <textarea
            aria-label="Summary"
            placeholder="Summary — what the engine must remember"
            rows={3}
            value={draft.summary}
            onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
            className="px-3 py-2 bg-background border border-border rounded-sm text-sm text-foreground md:col-span-4"
          />
        </div>
        <button
          type="button"
          onClick={create}
          disabled={saving}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-sm font-display text-sm disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} ADD
        </button>
      </section>

      <div className="overflow-x-auto border border-border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-card/60 text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3 font-display">KIND</th>
              <th className="text-left px-4 py-3 font-display">NAME</th>
              <th className="text-left px-4 py-3 font-display">SUMMARY</th>
              <th className="text-left px-4 py-3 font-display">EP</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border align-top">
                <td className="px-4 py-3 text-primary">{r.kind}</td>
                <td className="px-4 py-3 text-foreground">{r.name}</td>
                <td className="px-4 py-3 text-muted-foreground max-w-md">{r.summary}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.first_seen_episode ?? "—"}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => remove(r.id)}
                    aria-label={`Delete ${r.name}`}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No lore entries yet. The weekly engine will add them as episodes publish.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
