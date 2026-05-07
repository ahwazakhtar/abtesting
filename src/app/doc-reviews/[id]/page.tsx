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

  const [iterating, setIterating] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [iterateBusy, setIterateBusy] = useState(false);

  const [regenerating, setRegenerating] = useState(false);

  // Non-technical is the default first tab
  const [activeTab, setActiveTab] = useState<"simple" | "technical">("simple");

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
      <Link href="/doc-reviews" className="text-xs hover:underline" style={{ color: "var(--fg-4)" }}>
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
                className="mt-0.5 block truncate text-xs hover:underline"
                style={{ color: "var(--fg-4)" }}
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
                  className="rounded border px-3 py-1.5 text-xs font-medium transition"
                  style={{ borderColor: "var(--border)", color: "var(--fg-2)" }}
                >
                  Edit manually
                </button>
                <button
                  onClick={regenerate}
                  disabled={regenerating}
                  className="rounded border px-3 py-1.5 text-xs font-medium transition disabled:opacity-60"
                  style={{ borderColor: "var(--border)", color: "var(--fg-2)" }}
                >
                  {regenerating ? "Regenerating…" : "Regenerate"}
                </button>
              </div>
            )}
          </div>
          <p className="mt-1 text-xs" style={{ color: "var(--fg-4)" }}>
            Reviewed {new Date(review.updatedAt).toLocaleString()}
            {review.history && review.history.length > 0 && (
              <span className="ml-2" style={{ color: "var(--fg-4)" }}>
                · {review.history.length} prior version{review.history.length !== 1 ? "s" : ""}
              </span>
            )}
          </p>
        </>
      )}

      {error && (
        <div className="mt-4 rounded px-3 py-2 text-sm text-red-700 bg-red-50 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Iterate panel */}
      {iterating && (
        <form
          onSubmit={submitIteration}
          className="mt-6 rounded-lg border p-5"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <h2 className="text-sm font-semibold" style={{ color: "var(--fg)" }}>Iterate on review</h2>
          <p className="mt-1 text-xs" style={{ color: "var(--fg-3)" }}>
            Describe what changed in the document, provide corrections, or give the reviewer
            new context. The existing review will be updated and saved to history.
          </p>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={5}
            autoFocus
            placeholder="e.g. The authors revised the power calculation to use ICC = 0.15 and added an attrition buffer of 20%."
            className="mt-3 w-full rounded border px-3 py-2 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-accent"
            style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--fg)" }}
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
              className="rounded border px-4 py-2 text-sm font-medium transition"
              style={{ borderColor: "var(--border)", color: "var(--fg-2)" }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Current review */}
      {review && (
        <div className="mt-6 rounded-lg border" style={{ borderColor: "var(--amber-border)", background: "var(--amber-bg)" }}>
          <div className="flex items-center gap-2 border-b px-4 py-3" style={{ borderColor: "var(--amber-border)" }}>
            <span className="text-sm font-semibold" style={{ color: "var(--amber-heading)" }}>
              M&amp;E Review
            </span>
            {review.history && review.history.length > 0 && (
              <span className="ml-1 rounded-full px-2 py-0.5 text-xs font-medium"
                style={{ background: "var(--amber-border)", color: "var(--amber-heading)" }}>
                v{review.history.length + 1}
              </span>
            )}
            {!editing && (
              <div className="ml-auto flex gap-1">
                <button
                  onClick={() => setActiveTab("simple")}
                  className={`rounded px-2.5 py-1 text-xs font-medium transition ${
                    activeTab === "simple" ? "bg-amber-600 text-white" : ""
                  }`}
                  style={activeTab !== "simple" ? { color: "var(--amber-text)" } : {}}
                >
                  In plain terms
                </button>
                <button
                  onClick={() => setActiveTab("technical")}
                  className={`rounded px-2.5 py-1 text-xs font-medium transition ${
                    activeTab === "technical" ? "bg-amber-600 text-white" : ""
                  }`}
                  style={activeTab !== "technical" ? { color: "var(--amber-text)" } : {}}
                >
                  Technical
                </button>
              </div>
            )}
          </div>
          <div className="px-4 py-4">
            {editing ? (
              <div className="space-y-3">
                <textarea
                  value={editDraft}
                  onChange={(e) => setEditDraft(e.target.value)}
                  rows={30}
                  className="w-full rounded border px-3 py-2 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                  style={{ borderColor: "var(--amber-border)", background: "var(--surface)", color: "var(--fg)" }}
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
                    className="rounded border px-3 py-1.5 text-xs transition"
                    style={{ borderColor: "var(--border)", color: "var(--fg-3)" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : activeTab === "technical" ? (
              <div className="prose prose-sm max-w-none prose-headings:font-semibold">
                <Markdown>{review.review}</Markdown>
              </div>
            ) : (
              <div>
                <div className="prose prose-sm max-w-none">
                  <Markdown>{review.reviewSimplified ?? "(No plain-language explanation available. Regenerate the review to get one.)"}</Markdown>
                </div>
                {review.reviewKeyTerms && review.reviewKeyTerms.length > 0 && (
                  <div className="mt-5 rounded-md border p-4" style={{ borderColor: "var(--amber-border)" }}>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--amber-heading)" }}>
                      Key concepts used in this review
                    </p>
                    <dl className="space-y-3">
                      {review.reviewKeyTerms.map((t) => (
                        <div key={t.term}>
                          <dt className="text-sm font-semibold" style={{ color: "var(--amber-heading)" }}>{t.term}</dt>
                          <dd className="mt-0.5 text-sm" style={{ color: "var(--amber-text)" }}>{t.definition}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Version history */}
      {review?.history && review.history.length > 0 && (
        <div className="mt-6">
          <details className="rounded-lg border" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            <summary className="cursor-pointer px-4 py-3 text-sm font-medium" style={{ color: "var(--fg-2)" }}>
              Review history ({review.history.length} earlier version{review.history.length !== 1 ? "s" : ""})
            </summary>
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {[...review.history].reverse().map((v, i) => (
                <div key={i} className="px-4 py-4">
                  <div className="mb-2 flex items-baseline justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--fg-4)" }}>
                      v{review.history!.length - i} — {new Date(v.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <details className="mb-3">
                    <summary className="cursor-pointer text-xs hover:underline" style={{ color: "var(--fg-4)" }}>
                      Feedback that triggered this update
                    </summary>
                    <pre className="mt-1 whitespace-pre-wrap font-mono text-xs" style={{ color: "var(--fg-3)" }}>{v.feedback}</pre>
                  </details>
                  <div className="prose prose-sm max-w-none" style={{ color: "var(--fg-3)" }}>
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
        <details className="mt-6 rounded border" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
          <summary className="cursor-pointer px-4 py-3 text-sm font-medium" style={{ color: "var(--fg-2)" }}>
            Document content (fetched plain text)
          </summary>
          <pre className="max-h-96 overflow-y-auto px-4 pb-4 font-mono text-xs whitespace-pre-wrap" style={{ color: "var(--fg-3)" }}>
            {review.docContent}
          </pre>
        </details>
      )}
    </div>
  );
}
