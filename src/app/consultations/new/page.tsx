"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewConsultationPage() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/consultations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      router.push(`/consultations/${data.consultation.id}`);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/consultations" className="text-xs text-slate-500 hover:underline">
        ← PhD Advisor
      </Link>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">Ask a question</h1>
      <p className="mt-1 text-sm text-slate-600">
        Describe your methodological question. The advisor may ask follow-up
        questions before giving substantive advice.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={10}
          required
          placeholder="e.g. How should I set up an IRR test with 2 versions of a classroom observation tool? One is scored by human coaches, the other by an AI. I need to report the agreement before I can compare outcomes across arms."
          className="w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        {error && (
          <div className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={busy || !question.trim()}
            className="rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Getting advice…" : "Ask"}
          </button>
          <span className="text-xs text-slate-500">~5–15 seconds</span>
        </div>
      </form>
    </div>
  );
}
