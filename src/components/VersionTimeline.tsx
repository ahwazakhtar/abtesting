"use client";

import Link from "next/link";
import { Version } from "@/lib/types";

export default function VersionTimeline({
  experimentId,
  versions,
  currentVersion,
}: {
  experimentId: string;
  versions: Version[];
  currentVersion: number;
}) {
  return (
    <ol className="space-y-3">
      {[...versions].reverse().map((v) => {
        const isCurrent = v.number === currentVersion;
        return (
          <li
            key={v.number}
            className={`rounded-lg border p-4 ${
              isCurrent ? "border-accent bg-blue-50/40" : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex items-baseline justify-between gap-3">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-sm font-semibold">v{v.number}</span>
                <span className="text-xs uppercase tracking-wide text-slate-500">
                  {v.triggerKind.replace("_", " ")}
                </span>
              </div>
              <span className="text-xs text-slate-500">
                {new Date(v.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-700">{v.summary}</p>
            {v.number > 1 && (
              <div className="mt-3 flex gap-3 text-xs">
                <Link
                  href={`/experiments/${experimentId}/diff?from=${v.number - 1}&to=${v.number}`}
                  className="text-accent hover:underline"
                >
                  Diff vs v{v.number - 1}
                </Link>
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
