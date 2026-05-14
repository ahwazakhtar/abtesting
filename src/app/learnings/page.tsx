import LearningSection from "@/components/learnings/LearningSection";
import { getCurrentUser, matchesScope } from "@/lib/auth";
import { listExperiments } from "@/lib/storage";

export const dynamic = "force-dynamic";

const SECTIONS = [
  {
    key: "questions" as const,
    title: "What questions are we asking?",
    description: "Cross-experiment summary of hypotheses and research questions.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
        <circle cx={12} cy={12} r={10} />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.1 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3 M12 17h.01" />
      </svg>
    ),
  },
  {
    key: "indicators" as const,
    title: "What indicators are we tracking?",
    description: "Outcomes, instruments, and measurement plans across the portfolio.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18 M7 14l3-3 4 4 7-7" />
      </svg>
    ),
  },
  {
    key: "results" as const,
    title: "What results are we finding?",
    description: "Wins, null findings, surprises, and patterns from across experiments.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8 M12 17v4 M17 4h3v4a5 5 0 0 1-5 5 M7 4H4v4a5 5 0 0 0 5 5 M7 4h10v5a5 5 0 0 1-10 0V4z" />
      </svg>
    ),
  },
];

export default async function LearningsPage() {
  const user = getCurrentUser()!;
  const all = await listExperiments();
  const orgCount = all.filter((m) => matchesScope(m.ownerEmail, user, "org")).length;

  return (
    <div className="space-y-6">
      <section className="hero-card p-6 md:p-8">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--hero-muted)" }}>
            Organisation view · @{user.domain}
          </p>
          <h1 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight">
            What we&apos;re learning as an organisation
          </h1>
          <p className="mt-2 text-sm md:text-base" style={{ color: "var(--hero-muted)" }}>
            GPT reads every experiment in your workspace and synthesises three cross-cutting views.
            Click any section below to generate a fresh summary.
          </p>
          <p className="mt-3 text-xs" style={{ color: "var(--hero-muted)" }}>
            Currently {orgCount} experiment{orgCount === 1 ? "" : "s"} in scope.
          </p>
        </div>
      </section>

      <div className="space-y-4">
        {SECTIONS.map((s) => (
          <LearningSection
            key={s.key}
            sectionKey={s.key}
            title={s.title}
            description={s.description}
            icon={s.icon}
          />
        ))}
      </div>
    </div>
  );
}
