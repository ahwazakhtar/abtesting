"use client";

import { useState } from "react";
import Markdown from "./Markdown";
import { KeyTerm } from "@/lib/types";

interface Props {
  experimentId: string;
  versionNumber: number;
  initialReview?: string;
  initialReviewSimplified?: string;
  initialKeyTerms?: KeyTerm[];
}

export default function MEReviewPanel({
  experimentId,
  versionNumber,
  initialReview,
  initialReviewSimplified,
  initialKeyTerms,
}: Props) {
  const [review, setReview] = useState<string | null>(initialReview ?? null);
  const [simplified, setSimplified] = useState<string | null>(initialReviewSimplified ?? null);
  const [keyTerms, setKeyTerms] = useState<KeyTerm[]>(initialKeyTerms ?? []);
  const [status, setStatus] = useState<"idle" | "triggered" | "polling" | "done" | "error">(
    initialReview ? "done" : "idle",
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // Non-technical is the default first tab
  const [activeTab, setActiveTab] = useState<"simple" | "technical">("simple");

  async function requestReview() {
    setStatus("triggered");
    setErrorMsg(null);
    try {
      const res = await fetch(
        `/api/experiments/${experimentId}/versions/${versionNumber}/review`,
        { method: "POST" },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to trigger review");
      if (data.cached) {
        setReview(data.meReview);
        setSimplified(data.meReviewSimplified ?? null);
        setKeyTerms(data.meReviewKeyTerms ?? []);
        setStatus("done");
        return;
      }
      setStatus("polling");
      startPolling();
    } catch (e) {
      setErrorMsg((e as Error).message);
      setStatus("error");
    }
  }

  function startPolling() {
    let delay = 3000;
    let cancelled = false;

    async function poll() {
      if (cancelled) return;
      try {
        const res = await fetch(
          `/api/experiments/${experimentId}/versions/${versionNumber}/review`,
        );
        if (res.ok) {
          const data = await res.json();
          if (data.meReview) {
            if (!cancelled) {
              setReview(data.meReview);
              setSimplified(data.meReviewSimplified ?? null);
              setKeyTerms(data.meReviewKeyTerms ?? []);
              setStatus("done");
            }
            return;
          }
        }
      } catch { /* retry */ }
      if (!cancelled) {
        delay = Math.min(delay * 1.5, 15000);
        setTimeout(poll, delay);
      }
    }

    setTimeout(poll, delay);
  }

  return (
    <div className="mt-8 rounded-lg border" style={{ borderColor: "var(--amber-border)", background: "var(--amber-bg)" }}>
      <div className="flex items-center gap-2 border-b px-4 py-3" style={{ borderColor: "var(--amber-border)" }}>
        <span className="text-sm font-semibold" style={{ color: "var(--amber-heading)" }}>
          M&amp;E Review
        </span>

        {status === "done" && (
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

        {(status === "polling" || status === "triggered") && (
          <span className="ml-auto flex items-center gap-1.5 text-xs" style={{ color: "var(--amber-text)" }}>
            <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx={12} cy={12} r={10} strokeOpacity={0.25} />
              <path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
            Generating review…
          </span>
        )}
      </div>

      <div className="px-4 py-4">
        {status === "idle" && (
          <div className="flex items-center gap-4">
            <p className="text-sm" style={{ color: "var(--amber-text)" }}>
              Request an M&amp;E quality review of this experiment version.
            </p>
            <button
              onClick={requestReview}
              className="shrink-0 rounded bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700"
            >
              Request M&amp;E Review
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-2">
            <p className="text-sm text-red-600">{errorMsg}</p>
            <button
              onClick={requestReview}
              className="rounded border border-red-300 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
            >
              Retry
            </button>
          </div>
        )}

        {(status === "triggered" || status === "polling") && (
          <p className="text-sm" style={{ color: "var(--amber-text)" }}>
            Generating M&amp;E review — this takes about 30–60 seconds…
          </p>
        )}

        {status === "done" && (
          <>
            {activeTab === "simple" && (
              <div>
                <div className="prose prose-sm max-w-none">
                  <Markdown>{simplified ?? "(No plain-language explanation available.)"}</Markdown>
                </div>
                {keyTerms.length > 0 && (
                  <KeyTermsInline keyTerms={keyTerms} />
                )}
              </div>
            )}
            {activeTab === "technical" && review && (
              <div className="prose prose-sm max-w-none prose-headings:font-semibold">
                <Markdown>{review}</Markdown>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function KeyTermsInline({ keyTerms }: { keyTerms: KeyTerm[] }) {
  return (
    <div className="mt-5 rounded-md border p-4" style={{ borderColor: "var(--amber-border)" }}>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--amber-heading)" }}>
        Key concepts used in this review
      </p>
      <dl className="space-y-3">
        {keyTerms.map((t) => (
          <div key={t.term}>
            <dt className="text-sm font-semibold" style={{ color: "var(--amber-heading)" }}>{t.term}</dt>
            <dd className="mt-0.5 text-sm" style={{ color: "var(--amber-text)" }}>{t.definition}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
