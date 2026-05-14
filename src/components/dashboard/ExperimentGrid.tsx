import Link from "next/link";
import { ExperimentMeta } from "@/lib/types";
import ProgressBar from "@/components/ui/ProgressBar";
import Pill from "@/components/ui/Pill";

export interface DashboardExperiment extends ExperimentMeta {
  progress: number;
  status: "Drafting" | "Reviewing" | "Iterating" | "In progress";
  filledStages: number;
  totalStages: number;
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

export default function ExperimentGrid({ experiments, currentUserEmail }: Props) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {experiments.map((e) => {
        const mine = currentUserEmail && e.ownerEmail === currentUserEmail;
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

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs" style={{ color: "var(--fg-4)" }}>
                  <span>Plan completeness</span>
                  <span>{e.progress}%</span>
                </div>
                <ProgressBar value={e.progress} className="mt-1" />
              </div>

              <div className="mt-4 flex items-center justify-between gap-2 text-xs" style={{ color: "var(--fg-4)" }}>
                <span className="truncate">
                  {e.ownerEmail ? (
                    <>
                      <span style={mine ? { color: "var(--accent)" } : undefined}>
                        {mine ? "You" : e.ownerEmail}
                      </span>
                      <span> · v{e.currentVersion} · {e.filledStages}/{e.totalStages} stages</span>
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
