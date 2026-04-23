"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Experiment, Proposal } from "@/lib/types";
import DiffView from "@/components/DiffView";

type TriggerKind = "feedback" | "meeting_notes" | "manual_edit";

export default function IteratePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [exp, setExp] = useState<Experiment | null>(null);
  const [triggerKind, setTriggerKind] = useState<TriggerKind>("feedback");
  const [triggerText, setTriggerText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    fetch(`/api/experiments/${id}`)
      .then((r) => r.json())
      .then((d) => setExp(d.experiment))
      .catch((e) => setError(String(e)));
  }, [id]);

  async function propose() {
    setBusy(true);
    setError(null);
    setProposal(null);
    try {
      const res = await fetch(`/api/experiments/${id}/propose`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ triggerKind, triggerText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setProposal(data.proposal);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function accept() {
    if (!proposal) return;
    setAccepting(true);
    try {
      const res = await fetch(`/api/experiments/${id}/versions`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ proposal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      router.push(`/experiments/${id}`);
    } catch (e) {
      setError((e as Error).message);
      setAccepting(false);
    }
  }

  const current = exp?.versions[exp.versions.length - 1];

  return (
    <div>
      <Link href={`/experiments/${id}`} className="text-xs text-slate-500 hover:underline">
        ← Back to experiment
      </Link>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">
        Iterate on the plan
      </h1>
      <p className="mt-1 text-sm text-slate-600">
        Paste feedback or meeting notes. The model proposes a revision; you review the diff and accept or discard.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="font-semibold">New input</h2>
          <div className="mt-3">
            <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Type
            </label>
            <div className="mt-1 flex gap-2 text-sm">
              {(
                [
                  ["feedback", "Feedback"],
                  ["meeting_notes", "Meeting notes"],
                  ["manual_edit", "Manual edit request"],
                ] as [TriggerKind, string][]
              ).map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setTriggerKind(k)}
                  className={`rounded border px-3 py-1.5 ${
                    triggerKind === k
                      ? "border-accent bg-blue-50 text-accent"
                      : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={triggerText}
            onChange={(e) => setTriggerText(e.target.value)}
            rows={14}
            placeholder={
              triggerKind === "meeting_notes"
                ? "Paste the meeting notes verbatim. The model will figure out what to change."
                : triggerKind === "feedback"
                  ? "e.g. We're now able to recruit 339 schools (not 25). Partner wants a third arm with traditional coaching only. Sample size needs to be redone."
                  : "Describe the change you want made. e.g. Update the analysis plan to use cluster-robust SEs."
            }
            className="mt-3 w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={propose}
              disabled={busy || !triggerText.trim()}
              className="rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? "Drafting proposal…" : "Propose changes"}
            </button>
            {current && (
              <span className="text-xs text-slate-500">
                Will produce v{current.number + 1} if accepted.
              </span>
            )}
          </div>
          {error && (
            <div className="mt-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          )}
        </section>

        <section>
          <h2 className="font-semibold">Proposed change</h2>
          {!proposal ? (
            <div className="mt-3 rounded border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
              The proposed diff will appear here.
            </div>
          ) : (
            <div className="mt-3 space-y-4">
              <div className="rounded border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Summary
                </p>
                <p className="mt-1 text-sm text-slate-800">{proposal.summary}</p>
              </div>
              {current && (
                <DiffView
                  before={current.stages}
                  after={proposal.stages}
                  rationale={proposal.rationale}
                />
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={accept}
                  disabled={accepting}
                  className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {accepting ? "Saving…" : `Accept as v${(current?.number ?? 0) + 1}`}
                </button>
                <button
                  type="button"
                  onClick={() => setProposal(null)}
                  className="rounded border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-400"
                >
                  Discard
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
