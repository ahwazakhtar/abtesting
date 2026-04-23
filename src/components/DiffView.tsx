"use client";

import { Stage, STAGE_META, STAGE_ORDER, StageId } from "@/lib/types";
import { diffStages } from "@/lib/diff";

export default function DiffView({
  before,
  after,
  rationale,
  highlightUnchanged = false,
}: {
  before: Stage[];
  after: Stage[];
  rationale?: Partial<Record<StageId, string>>;
  highlightUnchanged?: boolean;
}) {
  const diffs = diffStages(before, after);
  return (
    <div className="space-y-5">
      {diffs.map((d, i) => {
        if (!d.changed && !highlightUnchanged) return null;
        return (
          <section
            key={d.id}
            className={`rounded-lg border p-5 ${
              d.changed ? "border-amber-300 bg-amber-50/40" : "border-slate-200 bg-white"
            }`}
          >
            <div className="mb-2 flex items-baseline justify-between">
              <h3 className="text-base font-semibold tracking-tight">
                <span className="mr-2 text-slate-400">{i + 1}.</span>
                {STAGE_META[d.id].title}
                {!d.changed && (
                  <span className="ml-2 text-xs font-normal text-slate-500">(unchanged)</span>
                )}
              </h3>
            </div>
            {d.changed && rationale?.[d.id] && (
              <p className="mb-3 rounded bg-white/70 px-3 py-2 text-xs text-slate-700">
                <span className="font-semibold">Why:</span> {rationale[d.id]}
              </p>
            )}
            <div className="whitespace-pre-wrap font-mono text-xs leading-relaxed">
              {d.changes.map((c, idx) => (
                <span
                  key={idx}
                  className={c.added ? "diff-add" : c.removed ? "diff-del" : ""}
                >
                  {c.value}
                </span>
              ))}
            </div>
          </section>
        );
      })}
      {diffs.every((d) => !d.changed) && (
        <p className="rounded border border-dashed border-slate-300 bg-white p-4 text-center text-sm text-slate-500">
          No textual differences between these versions.
        </p>
      )}
      {/* Show the unchanged stages as a footer summary */}
      {!highlightUnchanged && diffs.some((d) => !d.changed) && (
        <p className="text-xs text-slate-500">
          Unchanged: {STAGE_ORDER.filter((id) => !diffs.find((d) => d.id === id)?.changed)
            .map((id) => STAGE_META[id].title)
            .join(", ")}
        </p>
      )}
    </div>
  );
}
