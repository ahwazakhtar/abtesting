"use client";

import { useState } from "react";
import { Asset } from "@/lib/types";

interface Props {
  experimentId: string;
  initialAssets: Asset[];
}

export default function AssetsPane({ experimentId, initialAssets }: Props) {
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addAsset(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim() || !url.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/experiments/${experimentId}/assets`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ label: label.trim(), url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setAssets(data.assets);
      setLabel("");
      setUrl("");
      setAdding(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function removeAsset(assetId: string) {
    try {
      const res = await fetch(
        `/api/experiments/${experimentId}/assets?assetId=${encodeURIComponent(assetId)}`,
        { method: "DELETE" },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setAssets(data.assets);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="mt-6 rounded-lg border" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
      <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: "var(--border)" }}>
        <span className="text-sm font-semibold" style={{ color: "var(--fg-2)" }}>
          Linked Assets
        </span>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="text-xs font-medium text-accent hover:underline"
          >
            + Add link
          </button>
        )}
      </div>

      <div className="px-4 py-3">
        {error && (
          <p className="mb-2 text-xs text-red-600">{error}</p>
        )}

        {assets.length === 0 && !adding && (
          <p className="text-sm" style={{ color: "var(--fg-4)" }}>
            No assets linked yet. Add Google Docs, Drive folders, survey instruments, or any URL.
          </p>
        )}

        {assets.length > 0 && (
          <ul className="space-y-1.5 mb-3">
            {assets.map((a) => (
              <li key={a.id} className="flex items-center gap-2 text-sm">
                <svg className="h-3.5 w-3.5 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <a
                  href={a.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 truncate font-medium text-accent hover:underline"
                >
                  {a.label}
                </a>
                <span className="truncate max-w-[200px] text-xs" style={{ color: "var(--fg-4)" }}>
                  {a.url}
                </span>
                <button
                  onClick={() => removeAsset(a.id)}
                  className="ml-1 shrink-0 text-xs hover:text-red-600"
                  style={{ color: "var(--fg-4)" }}
                  title="Remove"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}

        {adding && (
          <form onSubmit={addAsset} className="mt-2 space-y-2">
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Label (e.g. Survey instrument)"
              autoFocus
              className="w-full rounded border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
              style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--fg)" }}
            />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="URL (Google Doc, Drive, etc.)"
              className="w-full rounded border px-3 py-1.5 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-accent"
              style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--fg)" }}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={busy || !label.trim() || !url.trim()}
                className="rounded bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {busy ? "Adding…" : "Add"}
              </button>
              <button
                type="button"
                onClick={() => { setAdding(false); setLabel(""); setUrl(""); setError(null); }}
                className="rounded border px-3 py-1.5 text-xs font-medium"
                style={{ borderColor: "var(--border)", color: "var(--fg-3)" }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
