"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewDocReviewPage() {
  const router = useRouter();
  const [docUrl, setDocUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/doc-reviews", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ docUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      router.push(`/doc-reviews/${data.review.id}`);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/doc-reviews" className="text-xs text-slate-500 hover:underline">
        ← Doc Review
      </Link>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">Review a Google Doc</h1>
      <p className="mt-1 text-sm text-slate-600">
        Paste the URL of any Google Doc. The document must be shared as{" "}
        <strong>Anyone with the link can view</strong>.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Google Doc URL</label>
          <input
            type="url"
            value={docUrl}
            onChange={(e) => setDocUrl(e.target.value)}
            required
            placeholder="https://docs.google.com/document/d/…/edit"
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <div className="rounded border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
          <p className="font-medium text-slate-700">What gets reviewed</p>
          <p className="mt-1">
            The doc is fetched as plain text and reviewed across: research question &amp;
            theory of change, experimental design, sampling &amp; power, measurement,
            analysis plan, threats to validity, ethics, and presentation clarity.
          </p>
        </div>

        {error && (
          <div className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={busy || !docUrl.trim()}
            className="rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Fetching & reviewing…" : "Generate review"}
          </button>
          <span className="text-xs text-slate-500">~15–30 seconds</span>
        </div>
      </form>
    </div>
  );
}
