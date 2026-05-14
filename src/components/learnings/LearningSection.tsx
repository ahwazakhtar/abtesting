"use client";

import { ReactNode, useState } from "react";
import Markdown from "@/components/Markdown";

interface Props {
  sectionKey: "questions" | "indicators" | "results";
  title: string;
  description: string;
  icon: ReactNode;
}

export default function LearningSection({ sectionKey, title, description, icon }: Props) {
  const [summary, setSummary] = useState<string | null>(null);
  const [count, setCount] = useState<number | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/learnings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ section: sectionKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate summary");
      setSummary(data.summary);
      setCount(data.count ?? null);
      setGeneratedAt(data.generatedAt ?? new Date().toISOString());
      setStatus("done");
    } catch (e) {
      setError((e as Error).message);
      setStatus("error");
    }
  }

  return (
    <section className="card overflow-hidden">
      <header
        className="flex flex-wrap items-start gap-4 border-b px-5 py-4"
        style={{ borderColor: "var(--border)" }}
      >
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white"
          style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-2))" }}
        >
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold tracking-tight" style={{ color: "var(--fg)" }}>
            {title}
          </h2>
          <p className="mt-0.5 text-sm" style={{ color: "var(--fg-3)" }}>{description}</p>
          {count !== null && generatedAt && (
            <p className="mt-1 text-xs" style={{ color: "var(--fg-4)" }}>
              Synthesised from {count} experiment{count === 1 ? "" : "s"} · {new Date(generatedAt).toLocaleString()}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={generate}
          disabled={status === "loading"}
          className="rounded-xl px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-2))" }}
        >
          {status === "loading"
            ? "Generating…"
            : summary
              ? "Regenerate"
              : "Generate summary"}
        </button>
      </header>

      <div className="px-5 py-5">
        {status === "idle" && (
          <p className="text-sm" style={{ color: "var(--fg-4)" }}>
            Click <strong style={{ color: "var(--fg-3)" }}>Generate summary</strong> to have GPT synthesise this view across every experiment in your workspace.
          </p>
        )}

        {status === "loading" && (
          <div className="flex items-center gap-2 text-sm" style={{ color: "var(--fg-3)" }}>
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx={12} cy={12} r={10} strokeOpacity={0.25} />
              <path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
            Reading across the portfolio and synthesising…
          </div>
        )}

        {status === "error" && error && (
          <p
            className="rounded-lg px-3 py-2 text-sm"
            style={{ background: "var(--danger-soft)", color: "var(--danger)" }}
          >
            {error}
          </p>
        )}

        {status === "done" && summary && (
          <div className="prose-md">
            <Markdown>{summary}</Markdown>
          </div>
        )}
      </div>
    </section>
  );
}
