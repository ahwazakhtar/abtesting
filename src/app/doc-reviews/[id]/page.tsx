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

  // Editing state
  const [editing, setEditing] = useState(false);
  const [editDraft, setEditDraft] = useState("");
  const [saving, setSaving] = useState(false);

  // Iteration state
  const [iterating, setIterating] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [iterateBusy, setIterateBusy] = useState(false);

  // Regenerate state
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
    setIterating(false);
  }

  async function saveEdit() {
    if (!editDraft.trim()) return;
    setSaving(true);
    setError(null);
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

  async function submitIteration(e: React.FormEvent) {
    e.preventDefault();
    if (!feedback.trim()) return;
    setIterateBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/doc-reviews/${id}/iterate`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ feedback }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setReview(data.review);
      setFeedback("");
      setIterating(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIterateBusy(false);
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
            {!editing && !iterating && (
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => setIterating(true)}
                  className="rounded bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                >
                  Iterate on review
                </button>
                <button
                  onClick={startEdit}
                  className="rounded border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-400"
                >
                  Edit manually
                </button>
                <button
                  onClick={regenerate}
                  disabled={regenerating}
                  className="rounded border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-400 disabled:opacity-60"
                >
                  {regenerating ? "Regenerating…" : "Regenerate"}
                </button>
              </div>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Reviewed {new Date(review.updatedAt).toLocaleString()}
            {review.history && review.history.length > 0 && (
              <span className="ml-2 text-slate-400">
                · {review.history.length} prior version{review.history.length !== 1 ? "s" : ""}
              </span>
            )}
          </p>
        </>
      )}

      {error && (
        <div className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      {/* Iterate panel */}
      {iterating && (
        <form
          onSubmit={submitIteration}
          className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-5"
        >
          <h2 className="text-sm font-semibold text-blue-900">Iterate on review</h2>
          <p className="mt-1 text-xs text-blue-700">
            Describe what changed in the document, provide corrections, or give the reviewer
            new context. The existing review will be updated and saved to history.
          </p>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={5}
            autoFocus
            placeholder="e.g. The authors revised the power calculation to use ICC = 0.15 and added an attrition buffer of 20%. The analysis plan now pre-specifies the omnibus F-test before pairwise comparisons."
            className="mt-3 w-full rounded border border-blue-300 bg-white px-3 py-2 font-mono text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <div className="mt-3 flex gap-2">
            <button
              type="submit"
              disabled={iterateBusy || !feedback.trim()}
              className="rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {iterateBusy ? "Updating review…" : "Update review"}
            </button>
            <button
              type="button"
              onClick={() => { setIterating(false); setFeedback(""); }}
              className="rounded border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-400"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Current review */}
      {review && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50">
          <div className="flex items-center gap-2 border-b border-amber-200 px-4 py-3">
            <span className="text-sm font-semibold text-amber-900">PhD Economist Review</span>
            {review.history && review.history.length > 0 && (
              <span className="ml-1 rounded-full bg-amber-200 px-2 py-0.5 text-xs font-medium text-amber-800">
                v{review.history.length + 1}
              </span>
            )}
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

      {/* Version history */}
      {review?.history && review.history.length > 0 && (
        <div className="mt-6">
          <details className="rounded-lg border border-slate-200 bg-white">
            <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-slate-700">
              Review history ({review.history.length} earlier version{review.history.length !== 1 ? "s" : ""})
            </summary>
            <div className="divide-y divide-slate-100">
              {[...review.history].reverse().map((v, i) => (
                <div key={i} className="px-4 py-4">
                  <div className="mb-2 flex items-baseline justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      v{review.history!.length - i} — {new Date(v.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <details className="mb-3">
                    <summary className="cursor-pointer text-xs text-slate-500 hover:text-slate-700">
                      Feedback that triggered this update
                    </summary>
                    <pre className="mt-1 whitespace-pre-wrap font-mono text-xs text-slate-600">{v.feedback}</pre>
                  </details>
                  <div className="prose prose-sm max-w-none text-slate-600">
                    <Markdown>{v.review}</Markdown>
                  </div>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}

      {/* Raw document content */}
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
