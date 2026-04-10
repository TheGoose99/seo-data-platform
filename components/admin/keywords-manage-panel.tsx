"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { RefreshCw } from "lucide-react";

type Props = {
  orgId: string;
  clientId: string;
  locationId: string | null;
  initialKeywords: string[];
  hasLatLng: boolean;
  dataForSeoConfigured: boolean;
};

function normalizeKeyword(s: string) {
  return s.toLowerCase().trim().replace(/\s+/g, " ");
}

export function KeywordsManagePanel(props: Props) {
  const router = useRouter();
  const [filter, setFilter] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [keywordTags, setKeywordTags] = useState<string[]>(props.initialKeywords);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const addKeyword = useCallback((raw: string) => {
    const t = raw.trim();
    if (!t) return;
    const norm = normalizeKeyword(t);
    setKeywordTags((prev) => {
      if (prev.some((k) => normalizeKeyword(k) === norm)) return prev;
      return [...prev, t];
    });
  }, []);

  function onKeywordKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    addKeyword(keywordInput);
    setKeywordInput("");
  }

  async function saveKeywords() {
    setStatus(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/clients/${encodeURIComponent(props.clientId)}/keywords`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orgId: props.orgId, keywords: keywordTags }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setStatus(json.error ?? "Save failed");
        return;
      }
      setStatus("Saved.");
      router.refresh();
    } catch (e) {
      setStatus(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  async function syncSerp() {
    if (!props.locationId) return;
    setStatus(null);
    setSyncing(true);
    try {
      const res = await fetch("/api/jobs/ingest-serp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          orgId: props.orgId,
          clientId: props.clientId,
          locationId: props.locationId,
        }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setStatus(json.error ?? "SERP ingest failed");
        return;
      }
      setStatus("SERP ingest completed.");
      router.refresh();
    } catch (e) {
      setStatus(e instanceof Error ? e.message : String(e));
    } finally {
      setSyncing(false);
    }
  }

  const q = filter.trim().toLowerCase();

  const syncDisabled =
    !props.dataForSeoConfigured ||
    !props.hasLatLng ||
    !props.locationId ||
    keywordTags.length < 1 ||
    syncing;

  let syncTitle = "Run SERP grid ingest (last 3 days)";
  if (!props.dataForSeoConfigured) syncTitle = "Configure DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD";
  else if (!props.hasLatLng) syncTitle = "Primary location needs latitude and longitude";
  else if (keywordTags.length < 1) syncTitle = "Add at least one keyword";

  return (
    <div className="space-y-6 rounded-xl border border-slate-800 bg-slate-900/40 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-medium text-white">Tracked keywords</h2>
          <p className="mt-1 text-sm text-slate-500">Type and press Enter to add. Click a tag to remove.</p>
        </div>
        <button
          type="button"
          title={syncTitle}
          disabled={syncDisabled}
          onClick={() => void syncSerp()}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} aria-hidden />
          Sync from DataForSEO
        </button>
      </div>

      <input
        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600"
        placeholder="Filter list…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />

      <input
        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600"
        placeholder="Add keyword — Enter"
        value={keywordInput}
        onChange={(e) => setKeywordInput(e.target.value)}
        onKeyDown={onKeywordKeyDown}
      />

      <div className="flex flex-wrap gap-2">
        {keywordTags
          .map((k, i) => ({ k, i }))
          .filter(({ k }) => (q ? k.toLowerCase().includes(q) : true))
          .map(({ k, i }) => (
            <button
              key={`${i}-${k}`}
              type="button"
              onClick={() => setKeywordTags((prev) => prev.filter((_, j) => j !== i))}
              className="inline-flex items-center gap-1 rounded-full border border-slate-600 bg-slate-900 px-3 py-1 text-xs text-slate-200 hover:bg-slate-800"
            >
              {k}
              <span className="text-slate-500">×</span>
            </button>
          ))}
      </div>

      {keywordTags.length === 0 ? (
        <p className="text-sm text-amber-400/90">Add at least one keyword to enable SERP sync.</p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={saving}
          onClick={() => void saveKeywords()}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save keywords"}
        </button>
        {status ? <span className="text-sm text-slate-400">{status}</span> : null}
      </div>
    </div>
  );
}
