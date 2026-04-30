"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Markdown from "@/components/Markdown";
import { Consultation, ConsultationMessage } from "@/lib/types";

export default function ConsultationPage() {
  const { id } = useParams<{ id: string }>();

  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/consultations/${id}`)
      .then((r) => r.json())
      .then((d) => setConsultation(d.consultation))
      .catch((e) => setError(String(e)));
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [consultation?.messages.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || busy) return;
    setBusy(true);
    setError(null);
    const text = input.trim();
    setInput("");
    // Optimistically append user message.
    const optimistic: ConsultationMessage = { id: "pending", role: "user", content: text };
    setConsultation((c) => c ? { ...c, messages: [...c.messages, optimistic] } : c);
    try {
      const res = await fetch(`/api/consultations/${id}/messages`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setConsultation(data.consultation);
    } catch (err) {
      setError((err as Error).message);
      // Remove the optimistic message on failure.
      setConsultation((c) =>
        c ? { ...c, messages: c.messages.filter((m) => m.id !== "pending") } : c,
      );
    } finally {
      setBusy(false);
    }
  }

  function startEdit(msg: ConsultationMessage) {
    setEditingId(msg.id);
    setEditDraft(msg.content);
  }

  async function saveEdit(messageId: string) {
    if (!editDraft.trim()) return;
    try {
      const res = await fetch(`/api/consultations/${id}/messages/${messageId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: editDraft.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setConsultation(data.consultation);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setEditingId(null);
      setEditDraft("");
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col" style={{ minHeight: "calc(100vh - 8rem)" }}>
      <div className="mb-4">
        <Link href="/consultations" className="text-xs text-slate-500 hover:underline">
          ← PhD Advisor
        </Link>
        {consultation && (
          <h1 className="mt-1 text-lg font-semibold leading-snug">{consultation.title}</h1>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      <div className="flex-1 space-y-4 pb-4">
        {consultation?.messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            msg={msg}
            isEditing={editingId === msg.id}
            editDraft={editDraft}
            onEdit={() => startEdit(msg)}
            onEditDraftChange={setEditDraft}
            onSaveEdit={() => saveEdit(msg.id)}
            onCancelEdit={() => { setEditingId(null); setEditDraft(""); }}
          />
        ))}

        {busy && (
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-800">
              PhD
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx={12} cy={12} r={10} strokeOpacity={0.25} />
                <path d="M12 2a10 10 0 0 1 10 10" />
              </svg>
              Thinking…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={send}
        className="sticky bottom-0 border-t border-slate-200 bg-paper pt-4"
      >
        <div className="flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(e); }
            }}
            rows={3}
            placeholder="Reply or ask a follow-up… (Enter to send, Shift+Enter for newline)"
            disabled={busy}
            className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="self-end rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

function MessageBubble({
  msg,
  isEditing,
  editDraft,
  onEdit,
  onEditDraftChange,
  onSaveEdit,
  onCancelEdit,
}: {
  msg: ConsultationMessage;
  isEditing: boolean;
  editDraft: string;
  onEdit: () => void;
  onEditDraftChange: (v: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
}) {
  const isUser = msg.role === "user";

  return (
    <div className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          isUser
            ? "bg-slate-200 text-slate-700"
            : "bg-amber-100 text-amber-800"
        }`}
      >
        {isUser ? "You" : "PhD"}
      </div>

      <div className={`group relative max-w-[85%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        {isEditing ? (
          <div className="w-full space-y-2">
            <textarea
              value={editDraft}
              onChange={(e) => onEditDraftChange(e.target.value)}
              rows={6}
              className="w-full rounded border border-accent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={onSaveEdit}
                className="rounded bg-accent px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
              >
                Save edit
              </button>
              <button
                onClick={onCancelEdit}
                className="rounded border border-slate-300 px-3 py-1 text-xs text-slate-600 hover:border-slate-400"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div
              className={`rounded-lg px-4 py-3 text-sm ${
                isUser
                  ? "bg-accent text-white"
                  : "border border-slate-200 bg-white text-slate-800"
              }`}
            >
              {isUser ? (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              ) : (
                <div className="prose prose-sm max-w-none prose-headings:font-semibold">
                  <Markdown>{msg.content}</Markdown>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {msg.editedAt && (
                <span className="text-xs text-slate-400">edited</span>
              )}
              <button
                onClick={onEdit}
                className="text-xs text-slate-400 opacity-0 transition-opacity hover:text-slate-600 group-hover:opacity-100"
              >
                Edit
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
