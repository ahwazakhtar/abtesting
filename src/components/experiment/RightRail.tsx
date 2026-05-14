"use client";

import { useState, ReactNode } from "react";

interface Props {
  versions: ReactNode;
  assets: ReactNode;
  comments: ReactNode;
}

type TabKey = "versions" | "assets" | "comments";

const TABS: { key: TabKey; label: string }[] = [
  { key: "versions", label: "Versions" },
  { key: "assets", label: "Assets" },
  { key: "comments", label: "Comments" },
];

export default function RightRail({ versions, assets, comments }: Props) {
  const [active, setActive] = useState<TabKey>("versions");

  return (
    <aside className="lg:sticky lg:top-20 lg:self-start">
      <div className="card overflow-hidden">
        <div
          className="flex items-center gap-1 border-b px-2 py-2"
          style={{ borderColor: "var(--border)" }}
          role="tablist"
        >
          {TABS.map((t) => {
            const isActive = active === t.key;
            return (
              <button
                key={t.key}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(t.key)}
                className="flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition"
                style={
                  isActive
                    ? { background: "var(--accent-soft)", color: "var(--accent)" }
                    : { color: "var(--fg-3)" }
                }
              >
                {t.label}
              </button>
            );
          })}
        </div>
        <div className="max-h-[70vh] overflow-y-auto thin-scroll p-4">
          {active === "versions" && versions}
          {active === "assets" && assets}
          {active === "comments" && comments}
        </div>
      </div>
    </aside>
  );
}
