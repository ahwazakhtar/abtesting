import Link from "next/link";
import { ExperimentMeta } from "@/lib/types";
import { ExperimentHealth } from "@/lib/experiment-health";
import ProgressBar from "@/components/ui/ProgressBar";
import Pill from "@/components/ui/Pill";

export interface DashboardExperiment extends ExperimentMeta {
  progress: number;
  status: "Drafting" | "Reviewing" | "Iterating" | "In progress";
  health: ExperimentHealth;
}

interface Props {
  experiments: DashboardExperiment[];
  currentUserEmail?: string;
}

const STATUS_TONE: Record<DashboardExperiment["status"], "accent" | "success" | "warning" | "info"> = {
  Drafting: "warning",
  Reviewing: "info",
  Iterating: "accent",
  "In progress": "success",
};

function HealthCell({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: string | number;
  tone: "neutral" | "success" | "warning" | "danger" | "accent";
  hint?: string;
}) {
  const fg: Record<typeof tone, string> = {
    neutral: "var(--fg-3)",
    success: "var(--success)",
    warning: "var(--warning)",
    danger: "var(--danger)",
    accent: "var(--accent)",
  };
  return (
    <div
      className="rounded-xl px-3 py-2"
      style={{ background: "var(--surface-2)" }}
    >
      <p className="text-[10px] font-medium uppercase tracking-wide" style={{ color: "var(--fg-4)" }}>
        {label}
      </p>
      <p className="mt-0.5 text-base font-semibold" style={{ color: fg[tone] }}>{value}</p>
      {hint && (
        <p className="text-[10px]" style={{ color: "var(--fg-4)" }}>{hint}</p>
      )}
    </div>
  );
}

export default function ExperimentGrid({ experiments, currentUserEmail }: Props) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {experiments.map((e) => {
        const mine = currentUserEmail && e.ownerEmail === currentUserEmail;
        const h = e.health;
        return (
          <li key={e.id}>
            <Link
              href={`/experiments/${e.id}`}
              className="card card-hover block h-full p-5"
            >
              <div className="flex items-start gap-4">
                <span
                  aria-hidden
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white"
                  style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-2))" }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-6 w-6">
                    <circle cx={12} cy={12} r={3} />
                    <circle cx={12} cy={12} r={7} strokeOpacity={0.5} />
                    <circle cx={12} cy={12} r={10} strokeOpacity={0.25} />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold leading-snug" style={{ color: "var(--fg)" }}>{e.title}</h3>
                    <Pill tone={STATUS_TONE[e.status]} dot>{e.status}</Pill>
                  </div>
                  {e.description && (
                    <p className="mt-1 line-clamp-2 text-sm" style={{ color: "var(--fg-3)" }}>
                      {e.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Health row — expanded by default */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                <HealthCell
                  label="Strengths"
                  value={h.hasReview ? h.strengths : "—"}
                  tone={h.strengths > 0 ? "success" : "neutral"}
                  hint={h.hasReview ? "in review" : "no review"}
                />
                <HealthCell
                  label="Challenges"
                  value={h.hasReview ? h.challenges : "—"}
                  tone={h.challenges > 0 ? "danger" : "neutral"}
                  hint={h.hasReview ? "flagged" : "no review"}
                />
                <HealthCell
                  label="Confidence"
                  value={`${h.confidence}%`}
                  tone={h.confidence >= 70 ? "success" : h.confidence >= 40 ? "accent" : "warning"}
                  hint={`${h.filledStages}/${h.totalStages} stages`}
                />
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs" style={{ color: "var(--fg-4)" }}>
                  <span>Plan completeness</span>
                  <span>{e.progress}%</span>
                </div>
                <ProgressBar value={e.progress} className="mt-1" />
              </div>

              <div className="mt-3 flex items-center justify-between gap-2 text-xs" style={{ color: "var(--fg-4)" }}>
                <span className="truncate">
                  {e.ownerEmail ? (
                    <>
                      <span style={mine ? { color: "var(--accent)" } : undefined}>
                        {mine ? "You" : e.ownerEmail}
                      </span>
                      <span> · v{e.currentVersion}</span>
                    </>
                  ) : (
                    <>Unassigned · v{e.currentVersion}</>
                  )}
                </span>
                <span className="whitespace-nowrap">Updated {new Date(e.updatedAt).toLocaleDateString()}</span>
              </div>
            </Link>
          </li>
        );
      })}

      <li>
        <Link
          href="/experiments/new"
          className="card card-hover flex h-full flex-col items-center justify-center gap-2 p-8 text-center"
          style={{ borderStyle: "dashed" }}
        >
          <span
            className="flex h-12 w-12 items-center justify-center rounded-full"
            style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
              <path strokeLinecap="round" d="M12 5v14M5 12h14" />
            </svg>
          </span>
          <p className="text-sm font-semibold" style={{ color: "var(--fg)" }}>Create new experiment</p>
          <p className="text-xs" style={{ color: "var(--fg-4)" }}>Draft v1 from a brief in seconds.</p>
        </Link>
      </li>
    </ul>
  );
}
