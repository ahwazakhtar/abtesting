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
            className="rounded-lg border border-slate-200 bg-white p-5"
          >
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-lg font-semibold tracking-tight">
                <span className="mr-2 text-slate-400">{i + 1}.</span>
                {STAGE_META[id].title}
              </h2>
              <span className="text-xs text-slate-500">{STAGE_META[id].blurb}</span>
            </div>
            {s?.content ? (
              <Markdown>{s.content}</Markdown>
            ) : (
              <p className="text-sm italic text-slate-400">Empty</p>
            )}
          </section>
        );
      })}
    </div>
  );
}
