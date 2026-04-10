"use client";

export function KeywordSelect(props: {
  clientId: string;
  locationId: string;
  orgId: string;
  keywordId: string;
  keywords: Array<{ id: string; keyword_raw: string }>;
}) {
  return (
    <select
      className="h-10 w-full rounded-md border border-black/10 bg-white px-3 text-sm dark:border-white/15 dark:bg-black"
      value={props.keywordId}
      onChange={(e) => {
        const id = e.target.value;
        window.location.href = `/dashboard/${encodeURIComponent(props.clientId)}/${encodeURIComponent(
          props.locationId
        )}?org_id=${encodeURIComponent(props.orgId)}&keyword_id=${encodeURIComponent(id)}`;
      }}
    >
      {props.keywords.map((k) => (
        <option key={k.id} value={k.id}>
          {k.keyword_raw}
        </option>
      ))}
    </select>
  );
}

