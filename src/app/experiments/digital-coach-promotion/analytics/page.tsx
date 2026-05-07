"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { GROUP_LABELS } from "@/lib/nieteGroupsData";

const EXPERIMENT_ID = "digital-coach-promotion";
const GROUPS = ["A", "B", "C"] as const;
type Group = (typeof GROUPS)[number];

const GROUP_COLORS: Record<Group, string> = {
  A: "#2563eb", // blue
  B: "#16a34a", // green
  C: "#d97706", // amber
};

interface SummaryData {
  groups: Record<string, { obs_count: number; school_count: number; avg_score: number | null }>;
  from: string;
  to: string;
}

interface WeekRow {
  week: string;
  A: number | null;
  B: number | null;
  C: number | null;
  obs_A: number;
  obs_B: number;
  obs_C: number;
}

interface SectionRow {
  section: string;
  A: number | null;
  B: number | null;
  C: number | null;
}

function ScoreBar({ value, max = 100 }: { value: number | null; max?: number }) {
  if (value === null) return <span className="text-slate-400 text-xs">—</span>;
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs tabular-nums w-10 text-right">{value}%</span>
    </div>
  );
}

function MiniLine({ weeks, group, color }: { weeks: WeekRow[]; group: Group; color: string }) {
  if (weeks.length < 2) return null;
  const values = weeks.map((w) => w[group]);
  const defined = values.filter((v): v is number => v !== null);
  if (defined.length === 0) return null;
  const min = Math.max(0, Math.min(...defined) - 5);
  const max = Math.min(100, Math.max(...defined) + 5);
  const range = max - min || 1;
  const W = 200;
  const H = 50;
  const pts = weeks
    .map((w, i) => {
      const v = w[group];
      if (v === null) return null;
      const x = (i / (weeks.length - 1)) * W;
      const y = H - ((v - min) / range) * H;
      return `${x},${y}`;
    })
    .filter(Boolean)
    .join(" ");

  return (
    <svg width={W} height={H} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      {weeks.map((w, i) => {
        const v = w[group];
        if (v === null) return null;
        const x = (i / (weeks.length - 1)) * W;
        const y = H - ((v - min) / range) * H;
        return <circle key={i} cx={x} cy={y} r={3} fill={color} />;
      })}
    </svg>
  );
}

export default function AnalyticsPage() {
  const [from, setFrom] = useState("2026-04-01");
  const [to, setTo] = useState("2026-05-31");
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [weeks, setWeeks] = useState<WeekRow[]>([]);
  const [sections, setSections] = useState<SectionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = `?from=${from}&to=${to}`;
      const [s, w, sec] = await Promise.all([
        fetch(`/api/analytics/summary${qs}`).then((r) => r.json()),
        fetch(`/api/analytics/weekly${qs}`).then((r) => r.json()),
        fetch(`/api/analytics/sections${qs}`).then((r) => r.json()),
      ]);
      if (s.error) throw new Error(s.error);
      setSummary(s);
      setWeeks(w.weeks ?? []);
      setSections(sec.sections ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href={`/experiments/${EXPERIMENT_ID}`}
            className="text-xs text-slate-500 hover:underline"
          >
            ← Experiment plan
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Digital Coach — Live Analytics
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            FICO observation data from production, filtered to the 339 experiment schools.
          </p>
        </div>

        {/* Date range filter */}
        <div className="flex items-center gap-2 shrink-0">
          <label className="text-xs text-slate-500">From</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="border border-slate-200 rounded px-2 py-1 text-sm"
          />
          <label className="text-xs text-slate-500">To</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="border border-slate-200 rounded px-2 py-1 text-sm"
          />
          <button
            onClick={fetchAll}
            className="rounded bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Error / loading */}
      {error && (
        <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <strong>Error:</strong> {error}
          {error.includes("not configured") && (
            <span>
              {" "}
              — add <code className="bg-red-100 px-1 rounded">PROD_FDE_DATABASE_*</code> vars to{" "}
              <code className="bg-red-100 px-1 rounded">.env.local</code>.
            </span>
          )}
        </div>
      )}

      {loading && !error && (
        <div className="text-sm text-slate-500 animate-pulse">Loading observation data…</div>
      )}

      {!loading && !error && summary && (
        <>
          {/* Summary cards */}
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Summary
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {GROUPS.map((g) => {
                const d = summary.groups[g];
                return (
                  <div key={g} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className="inline-block w-3 h-3 rounded-full"
                        style={{ background: GROUP_COLORS[g] }}
                      />
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Group {g}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mb-3">{GROUP_LABELS[g]}</div>
                    {d ? (
                      <dl className="space-y-1.5">
                        <div className="flex justify-between text-sm">
                          <dt className="text-slate-500">Observations</dt>
                          <dd className="font-semibold tabular-nums">{d.obs_count.toLocaleString()}</dd>
                        </div>
                        <div className="flex justify-between text-sm">
                          <dt className="text-slate-500">Schools</dt>
                          <dd className="font-semibold tabular-nums">{d.school_count}</dd>
                        </div>
                        <div className="flex justify-between text-sm">
                          <dt className="text-slate-500">Avg FICO score</dt>
                          <dd className="font-semibold tabular-nums">
                            {d.avg_score !== null ? `${d.avg_score}%` : "—"}
                          </dd>
                        </div>
                      </dl>
                    ) : (
                      <p className="text-sm text-slate-400">No observations yet</p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Section breakdown */}
          {sections.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                FICO Score by Section
              </h2>
              <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-4 py-2.5 font-medium text-slate-600 w-48">Section</th>
                      {GROUPS.map((g) => (
                        <th key={g} className="text-left px-4 py-2.5 font-medium" style={{ color: GROUP_COLORS[g] }}>
                          Group {g}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sections.map((sec, i) => (
                      <tr key={sec.section} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                        <td className="px-4 py-3 font-medium text-slate-700 text-xs">{sec.section}</td>
                        {GROUPS.map((g) => (
                          <td key={g} className="px-4 py-3 w-44">
                            <ScoreBar value={sec[g]} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Weekly trajectory */}
          {weeks.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Weekly FICO Score Trend
              </h2>

              {/* Mini sparklines */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                {GROUPS.map((g) => (
                  <div key={g} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="inline-block w-2 h-2 rounded-full"
                        style={{ background: GROUP_COLORS[g] }}
                      />
                      <span className="text-xs font-medium text-slate-600">Group {g} trajectory</span>
                    </div>
                    <MiniLine weeks={weeks} group={g} color={GROUP_COLORS[g]} />
                  </div>
                ))}
              </div>

              {/* Weekly data table */}
              <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-4 py-2.5 font-medium text-slate-600">Week of</th>
                      {GROUPS.map((g) => (
                        <th
                          key={g}
                          className="text-right px-4 py-2.5 font-medium"
                          style={{ color: GROUP_COLORS[g] }}
                        >
                          Group {g} score
                        </th>
                      ))}
                      {GROUPS.map((g) => (
                        <th key={`obs_${g}`} className="text-right px-4 py-2.5 font-medium text-slate-500">
                          Grp {g} obs
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {weeks.map((w, i) => (
                      <tr key={w.week} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                        <td className="px-4 py-2.5 tabular-nums">{w.week}</td>
                        {GROUPS.map((g) => (
                          <td
                            key={g}
                            className="px-4 py-2.5 text-right tabular-nums font-medium"
                            style={{ color: w[g] !== null ? GROUP_COLORS[g] : undefined }}
                          >
                            {w[g] !== null ? `${w[g]}%` : "—"}
                          </td>
                        ))}
                        {GROUPS.map((g) => (
                          <td key={`obs_${g}`} className="px-4 py-2.5 text-right tabular-nums text-slate-500">
                            {w[`obs_${g}`] || "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {weeks.length === 0 && sections.length === 0 && (
            <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500 text-sm">
              No observations found in the selected date range for the experiment schools.
            </div>
          )}
        </>
      )}
    </div>
  );
}
