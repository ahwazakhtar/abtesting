"use client";

import { Stage, STAGE_META, STAGE_ORDER } from "@/lib/types";
import Markdown from "./Markdown";

export default function StageList({ stages }: { stages: Stage[] }) {
  const byId = new Map(stages.map((s) => [s.id, s]));
  return (
    <div className="space-y-5">
      {STAGE_ORDER.map((id, i) => {
        const s = byId.get(id);
        return (
          <section
            key={id}
            id={`stage-${id}`}
            className="rounded-lg border p-5"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-lg font-semibold tracking-tight">
                <span className="mr-2" style={{ color: "var(--fg-4)" }}>{i + 1}.</span>
                {STAGE_META[id].title}
              </h2>
              <span className="text-xs" style={{ color: "var(--fg-4)" }}>{STAGE_META[id].blurb}</span>
            </div>
            {s?.content ? (
              <Markdown>{s.content}</Markdown>
            ) : (
              <p className="text-sm italic" style={{ color: "var(--fg-4)" }}>Empty</p>
            )}
          </section>
        );
      })}
    </div>
  );
}
