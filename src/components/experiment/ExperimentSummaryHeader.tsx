import Link from "next/link";
import { Experiment } from "@/lib/types";
import Pill from "@/components/ui/Pill";

interface Props {
  experiment: Experiment;
  status: "Drafting" | "Reviewing" | "Iterating" | "In progress";
}

const STATUS_TONE: Record<Props["status"], "warning" | "info" | "accent" | "success"> = {
  Drafting: "warning",
  Reviewing: "info",
  Iterating: "accent",
  "In progress": "success",
};

export default function ExperimentSummaryHeader({ experiment, status }: Props) {
  const current = experiment.versions[experiment.versions.length - 1];

  return (
    <div className="card p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 text-xs" style={{ color: "var(--fg-4)" }}>
            <Link href="/" className="hover:underline">All experiments</Link>
            <span aria-hidden>/</span>
            <span style={{ color: "var(--fg-3)" }}>{experiment.title}</span>
            <span className="ml-1">·</span>
            <span>v{current.number}</span>
          </div>
          <h1 className="mt-2 text-2xl md:text-[28px] font-semibold tracking-tight">
            {experiment.title}
          </h1>
          {experiment.description && (
            <p className="mt-2 text-sm" style={{ color: "var(--fg-3)" }}>
              {experiment.description}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Pill tone={STATUS_TONE[status]} dot>{status}</Pill>
            <Pill tone="neutral">{experiment.versions.length} version{experiment.versions.length === 1 ? "" : "s"}</Pill>
            <Pill tone="neutral">
              Updated {new Date(experiment.updatedAt).toLocaleDateString()}
            </Pill>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {experiment.id === "digital-coach-promotion" && (
            <Link
              href={`/experiments/${experiment.id}/analytics`}
              className="rounded-xl border px-3 py-2 text-sm font-medium transition hover:opacity-80"
              style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--fg-2)" }}
            >
              Live analytics
            </Link>
          )}
          <Link
            href={`/experiments/${experiment.id}/iterate`}
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-white transition hover:opacity-90"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-2))" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
            </svg>
            Iterate on plan
          </Link>
        </div>
      </div>
    </div>
  );
}
