"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type KeywordRow = { id: string; keyword_raw: string };

type Props = {
  orgId: string;
  clientId: string;
  locationId: string;
  clientDisplayName: string;
  locationAddress: string;
  keywords: KeywordRow[];
  /** keyword_id -> ISO date strings (YYYY-MM-DD), newest first */
  observedDatesByKeyword: Record<string, string[]>;
  initialKeywordId: string | null;
  initialObservedDate: string | null;
};

function isValidYmd(s: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

export function HeatmapQueryPanel(props: Props) {
  const router = useRouter();
  const {
    orgId,
    clientId,
    locationId,
    clientDisplayName,
    locationAddress,
    keywords,
    observedDatesByKeyword,
    initialKeywordId,
    initialObservedDate,
  } = props;

  const [keywordId, setKeywordId] = useState(initialKeywordId ?? "");
  const [observedDate, setObservedDate] = useState(initialObservedDate ?? "");

  const datesForKeyword = useMemo(() => {
    if (!keywordId) return [];
    return observedDatesByKeyword[keywordId] ?? [];
  }, [keywordId, observedDatesByKeyword]);

  const canSubmit =
    Boolean(keywordId) &&
    Boolean(observedDate) &&
    isValidYmd(observedDate) &&
    datesForKeyword.includes(observedDate);

  function applyQuery() {
    if (!canSubmit) return;
    const q = new URLSearchParams();
    q.set("org_id", orgId);
    q.set("keyword_id", keywordId);
    q.set("observed_date", observedDate);
    router.push(`/dashboard/${encodeURIComponent(clientId)}/${encodeURIComponent(locationId)}?${q.toString()}`);
  }

  return (
    <div className="rounded-2xl border border-black/10 p-4 dark:border-white/15">
      <div className="text-sm font-medium">Snapshot (saved)</div>
      <p className="mt-1 text-xs text-black/55 dark:text-white/55">
        These come from your client and location records. Change them on the client detail page (if you have access).
      </p>
      <dl className="mt-3 space-y-2 text-sm">
        <div>
          <dt className="text-xs text-black/50 dark:text-white/50">Business</dt>
          <dd className="font-medium text-black/90 dark:text-white/90">{clientDisplayName}</dd>
        </div>
        <div>
          <dt className="text-xs text-black/50 dark:text-white/50">Address</dt>
          <dd className="text-black/85 dark:text-white/85">{locationAddress}</dd>
        </div>
      </dl>

      <div className="mt-6 border-t border-black/10 pt-4 dark:border-white/15">
        <div className="text-sm font-medium">Heatmap query (editable)</div>
        <p className="mt-1 text-xs text-black/55 dark:text-white/55">
          Choose a keyword and an observation date that already exists in your SERP grid data, then load the heatmap.
        </p>

        <div className="mt-3 space-y-3">
          <div>
            <label className="block text-xs font-medium text-black/70 dark:text-white/70">Keyword</label>
            <select
              className="mt-1 h-10 w-full rounded-md border border-black/10 bg-white px-3 text-sm dark:border-white/15 dark:bg-black"
              value={keywordId}
              onChange={(e) => {
                const v = e.target.value;
                setKeywordId(v);
                setObservedDate("");
              }}
            >
              <option value="">Select keyword…</option>
              {keywords.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.keyword_raw}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-black/70 dark:text-white/70">Observation date</label>
            <select
              className="mt-1 h-10 w-full rounded-md border border-black/10 bg-white px-3 text-sm disabled:opacity-50 dark:border-white/15 dark:bg-black"
              disabled={!keywordId || datesForKeyword.length === 0}
              value={observedDate}
              onChange={(e) => setObservedDate(e.target.value)}
            >
              <option value="">
                {!keywordId
                  ? "Select a keyword first"
                  : datesForKeyword.length === 0
                    ? "No SERP snapshots yet — run ingest"
                    : "Select date…"}
              </option>
              {datesForKeyword.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            disabled={!canSubmit}
            onClick={applyQuery}
            className="w-full rounded-md bg-black px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-white/90"
          >
            Load heatmap
          </button>
        </div>
      </div>
    </div>
  );
}
