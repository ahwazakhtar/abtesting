"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Markdown from "@/components/Markdown";
import { DocReview } from "@/lib/types";

export default function DocReviewPage() {
  const { id } = useParams<{ id: string }>();

  const [review, setReview] = useState<DocReview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editDraft, setEditDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    fetch(`/api/doc-reviews/${id}`)
      .then((r) => r.json())
      .then((d) => setReview(d.review))
      .catch((e) => setError(String(e)));
  }, [id]);

  function startEdit() {
    if (!review) return;
    setEditDraft(review.review);
    setEditing(true);
  }

  async function saveEdit() {
    if (!editDraft.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/doc-reviews/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ review: editDraft }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setReview(data.review);
      setEditing(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function regenerate() {
    setRegenerating(true);
    setError(null);
    try {
      const res = await fetch(`/api/doc-reviews/${id}/regenerate`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setReview(data.review);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setRegenerating(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/doc-reviews" className="text-xs text-slate-500 hover:underline">
        ← Doc Review
      </Link>

      {review && (
        <>
          <div className="mt-1 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold leading-snug">{review.docTitle}</h1>
              <a
                href={review.docUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-0.5 block truncate text-xs text-slate-400 hover:text-slate-600"
              >
                {review.docUrl}
              </a>
            </div>
            <div className="flex shrink-0 gap-2">
              {!editing && (
                <>
                  <button
                    onClick={startEdit}
                    className="rounded border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-400"
                  >
                    Edit review
                  </button>
                  <button
                    onClick={regenerate}
                    disabled={regenerating}
                    className="rounded border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-400 disabled:opacity-60"
                  >
                    {regenerating ? "Regenerating…" : "Regenerate"}
                  </button>
                </>
              )}
            </div>
          </div>

          <p className="mt-1 text-xs text-slate-500">
            Reviewed {new Date(review.updatedAt).toLocaleString()}
          </p>
        </>
      )}

      {error && (
        <div className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      {review && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50">
          <div className="flex items-center gap-2 border-b border-amber-200 px-4 py-3">
            <span className="text-sm font-semibold text-amber-900">PhD Economist Review</span>
          </div>
          <div className="px-4 py-4">
            {editing ? (
              <div className="space-y-3">
                <textarea
                  value={editDraft}
                  onChange={(e) => setEditDraft(e.target.value)}
                  rows={30}
                  className="w-full rounded border border-amber-300 bg-white px-3 py-2 font-mono text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={saveEdit}
                    disabled={saving}
                    className="rounded bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    {saving ? "Saving…" : "Save"}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="rounded border border-slate-300 px-3 py-1.5 text-xs text-slate-600 hover:border-slate-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none prose-headings:text-amber-900 prose-headings:font-semibold prose-strong:text-amber-900">
                <Markdown>{review.review}</Markdown>
              </div>
            )}
          </div>
        </div>
      )}

      {review && (
        <details className="mt-6 rounded border border-slate-200 bg-white">
          <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-slate-700">
            Document content (fetched plain text)
          </summary>
          <pre className="max-h-96 overflow-y-auto px-4 pb-4 font-mono text-xs text-slate-600 whitespace-pre-wrap">
            {review.docContent}
          </pre>
        </details>
      )}
    </div>
  );
}
