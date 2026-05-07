"use client";

import { useState } from "react";
import { Comment } from "@/lib/types";

interface Props {
  experimentId: string;
  initialComments: Comment[];
}

function renderWithMentions(text: string) {
  const parts = text.split(/(@[\w.-]+)/g);
  return parts.map((part, i) =>
    part.startsWith("@") ? (
      <span key={i} className="mention">{part}</span>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

export default function CommentsSection({ experimentId, initialComments }: Props) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notified, setNotified] = useState<string[]>([]);

  async function postComment(e: React.FormEvent) {
    e.preventDefault();
    if (!authorName.trim() || !content.trim()) return;
    setBusy(true);
    setError(null);
    setNotified([]);
    try {
      const res = await fetch(`/api/experiments/${experimentId}/comments`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ authorName: authorName.trim(), content: content.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setComments(data.comments);
      setContent("");
      if (data.emailsSent?.length > 0) setNotified(data.emailsSent);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-6 rounded-lg border" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
      <div className="border-b px-4 py-3" style={{ borderColor: "var(--border)" }}>
        <span className="text-sm font-semibold" style={{ color: "var(--fg-2)" }}>
          Comments
        </span>
        {comments.length > 0 && (
          <span className="ml-2 text-xs" style={{ color: "var(--fg-4)" }}>
            {comments.length}
          </span>
        )}
      </div>

      <div className="divide-y" style={{ borderColor: "var(--border)" }}>
        {comments.length === 0 && (
          <p className="px-4 py-3 text-sm" style={{ color: "var(--fg-4)" }}>
            No comments yet. Use @name to notify a colleague.
          </p>
        )}
        {comments.map((c) => (
          <div key={c.id} className="px-4 py-3">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold" style={{ color: "var(--fg)" }}>
                {c.authorName}
              </span>
              <span className="text-xs" style={{ color: "var(--fg-4)" }}>
                {new Date(c.createdAt).toLocaleString()}
              </span>
              {c.mentions.length > 0 && (
                <span className="ml-auto text-xs" style={{ color: "var(--fg-4)" }}>
                  notified {c.mentions.map((m) => `@${m}`).join(", ")}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--fg-2)" }}>
              {renderWithMentions(c.content)}
            </p>
          </div>
        ))}
      </div>

      <form onSubmit={postComment} className="border-t px-4 py-3 space-y-2" style={{ borderColor: "var(--border)" }}>
        {error && <p className="text-xs text-red-600">{error}</p>}
        {notified.length > 0 && (
          <p className="text-xs text-green-600">
            Email alert sent to {notified.map((m) => `@${m}`).join(", ")}
          </p>
        )}
        <input
          type="text"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="Your name"
          className="w-full rounded border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
          style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--fg)" }}
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          placeholder="Add a comment… use @name to tag colleagues"
          className="w-full rounded border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
          style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--fg)" }}
        />
        <button
          type="submit"
          disabled={busy || !authorName.trim() || !content.trim()}
          className="rounded bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {busy ? "Posting…" : "Post comment"}
        </button>
      </form>
    </div>
  );
}
