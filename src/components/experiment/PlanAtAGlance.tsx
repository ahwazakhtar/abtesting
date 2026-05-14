import { Stage, Version } from "@/lib/types";

interface Props {
  current: Version;
}

interface GlanceCard {
  label: string;
  value: string;
  detail?: string;
  badge: string;
}

function stageContent(stages: Stage[], id: string): string {
  return stages.find((s) => s.id === id)?.content ?? "";
}

function extractInline(text: string, patterns: RegExp[]): string | null {
  for (const re of patterns) {
    const m = re.exec(text);
    if (m) return (m[1] ?? m[0]).trim().replace(/[*_`#]/g, "").slice(0, 60);
  }
  return null;
}

function firstSentence(text: string, limit = 80): string {
  const clean = text.replace(/[#*_`>]/g, " ").trim();
  if (!clean) return "—";
  const sentence = clean.split(/(?<=[.!?])\s+/)[0] ?? clean;
  return sentence.length > limit ? `${sentence.slice(0, limit - 1)}…` : sentence;
}

export default function PlanAtAGlance({ current }: Props) {
  const design = stageContent(current.stages, "design");
  const power = stageContent(current.stages, "power");
  const measurement = stageContent(current.stages, "measurement");
  const analysis = stageContent(current.stages, "analysis");

  const armsRaw = extractInline(design, [
    /\b(\d+\s*(?:arms?|groups?|conditions?))/i,
    /\b(treatment\s*(?:and|vs\.?|&)\s*control)/i,
  ]);
  const sampleSize = extractInline(`${design}\n${power}`, [
    /\b(n\s*[=≈]\s*[\d,]+(?:\s*per\s*(?:arm|group))?)/i,
    /\bsample\s*size\s*(?:of)?\s*([\d,]+)/i,
  ]);
  const duration = extractInline(`${design}\n${analysis}`, [
    /\b(\d+\s*(?:weeks?|months?|days?))/i,
  ]);
  const outcome = extractInline(measurement, [
    /primary\s+outcome[:\s]+([^\n.]+)/i,
    /outcome[:\s]+([^\n.]+)/i,
  ]);

  const cards: GlanceCard[] = [
    {
      label: "Design",
      badge: "A",
      value: armsRaw ?? "Treatment vs Control",
      detail: firstSentence(design),
    },
    {
      label: "Sample",
      badge: "B",
      value: sampleSize ?? "Sample size TBD",
      detail: firstSentence(power),
    },
    {
      label: "Outcome",
      badge: "C",
      value: outcome ?? "Primary outcome TBD",
      detail: firstSentence(measurement),
    },
    {
      label: "Analysis",
      badge: "D",
      value: duration ?? "Pre-registered plan",
      detail: firstSentence(analysis),
    },
  ];

  return (
    <section className="card p-5">
      <header className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold" style={{ color: "var(--fg)" }}>
          Experiment at a glance
        </h3>
        <a href="#stage-design" className="text-xs font-medium" style={{ color: "var(--accent)" }}>
          View full plan →
        </a>
      </header>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl border p-4"
            style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}
          >
            <div className="flex items-center gap-2">
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white"
                style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-2))" }}
              >
                {c.badge}
              </span>
              <span className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--fg-4)" }}>
                {c.label}
              </span>
            </div>
            <p className="mt-2 font-semibold" style={{ color: "var(--fg)" }}>{c.value}</p>
            {c.detail && (
              <p className="mt-1 line-clamp-2 text-xs" style={{ color: "var(--fg-3)" }}>{c.detail}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
