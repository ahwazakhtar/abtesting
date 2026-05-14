"use client";

import { useState } from "react";
import { Stage, STAGE_META, STAGE_ORDER } from "@/lib/types";
import Markdown from "./Markdown";
import Pill from "./ui/Pill";

function stageStatus(s: Stage | undefined): { label: string; tone: "neutral" | "warning" | "accent" | "success" } {
  const len = (s?.content ?? "").trim().length;
  if (!s || len === 0) return { label: "Empty", tone: "neutral" };
  if (len < 80) return { label: "Stub", tone: "warning" };
  if (len < 280) return { label: "Drafted", tone: "accent" };
  return { label: "Detailed", tone: "success" };
}

export default function StageList({ stages }: { stages: Stage[] }) {
  const byId = new Map(stages.map((s) => [s.id, s]));
  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    // First non-empty stage open by default
    const init: Record<string, boolean> = {};
    const firstFilled = STAGE_ORDER.find((id) => (byId.get(id)?.content ?? "").trim().length > 0);
    if (firstFilled) init[firstFilled] = true;
    return init;
  });

  function toggle(id: string) {
    setOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="card divide-y" style={{ borderColor: "var(--border)" }}>
      {STAGE_ORDER.map((id, i) => {
        const s = byId.get(id);
        const status = stageStatus(s);
        const isOpen = !!open[id];
        return (
          <section
            key={id}
            id={`stage-${id}`}
            className="px-5 py-3"
            style={{ borderColor: "var(--border)" }}
          >
            <button
              type="button"
              onClick={() => toggle(id)}
              className="flex w-full items-center gap-3 text-left"
              aria-expanded={isOpen}
            >
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                style={{ background: "var(--surface-2)", color: "var(--fg-3)" }}
              >
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold" style={{ color: "var(--fg)" }}>
                    {STAGE_META[id].title}
                  </span>
                  <Pill tone={status.tone}>{status.label}</Pill>
                </div>
                <p className="mt-0.5 text-xs" style={{ color: "var(--fg-4)" }}>
                  {STAGE_META[id].blurb}
                </p>
              </div>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                style={{ color: "var(--fg-4)" }}
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {isOpen && (
              <div className="ml-10 mt-3 pb-2">
                {s?.content ? (
                  <Markdown>{s.content}</Markdown>
                ) : (
                  <p className="text-sm italic" style={{ color: "var(--fg-4)" }}>Empty — iterate on the plan to add content for this stage.</p>
                )}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
