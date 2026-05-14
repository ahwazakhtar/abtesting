import { Stage, STAGE_META, STAGE_ORDER, Version } from "@/lib/types";
import Pill from "@/components/ui/Pill";
import ProgressBar from "@/components/ui/ProgressBar";

interface Props {
  current: Version;
}

function extractBullets(md: string | undefined, limit = 3): string[] {
  if (!md) return [];
  const lines = md.split(/\r?\n/);
  const bullets: string[] = [];
  for (const raw of lines) {
    const line = raw.trim();
    const m = /^(?:[-*+]|\d+\.)\s+(.*)/.exec(line);
    if (m) {
      const text = m[1].replace(/^\*\*([^*]+)\*\*:?\s*/, "$1: ");
      if (text.length > 4) bullets.push(text);
      if (bullets.length >= limit) break;
    }
  }
  if (bullets.length === 0) {
    const sentences = md.replace(/[#*_`>]/g, " ").split(/(?<=[.!?])\s+/);
    for (const s of sentences) {
      const t = s.trim();
      if (t.length > 24) bullets.push(t);
      if (bullets.length >= limit) break;
    }
  }
  return bullets;
}

export default function ScorecardRow({ current }: Props) {
  const reviewText = current.meReview ?? current.phdReview ?? "";

  const risks = extractBullets(reviewText, 3);
  const recs: string[] = current.meReviewKeyTerms?.length
    ? current.meReviewKeyTerms.slice(0, 3).map((t) => `${t.term}: ${t.definition}`)
    : extractBullets(current.meReviewSimplified, 3);

  const scores = STAGE_ORDER.map((id) => {
    const s = current.stages.find((x) => x.id === id) as Stage | undefined;
    const filled = (s?.content ?? "").trim().length;
    let score = 0;
    if (filled > 600) score = 100;
    else if (filled > 250) score = 75;
    else if (filled > 60) score = 45;
    else if (filled > 0) score = 20;
    return { id, score };
  });

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <section className="card p-5">
        <header className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold" style={{ color: "var(--fg)" }}>Top risks</h3>
          <Pill tone="danger">{risks.length || 0}</Pill>
        </header>
        {risks.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--fg-4)" }}>
            Request an M&amp;E review below to surface risks.
          </p>
        ) : (
          <ul className="space-y-2">
            {risks.map((r, i) => (
              <li key={i} className="flex gap-2 text-sm" style={{ color: "var(--fg-2)" }}>
                <span
                  className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: "var(--danger)" }}
                  aria-hidden
                />
                <span className="line-clamp-2">{r}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card p-5">
        <header className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold" style={{ color: "var(--fg)" }}>Recommended actions</h3>
          <Pill tone="accent">{recs.length || 0}</Pill>
        </header>
        {recs.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--fg-4)" }}>
            Key methods and definitions will appear here once a review is run.
          </p>
        ) : (
          <ul className="space-y-2">
            {recs.map((r, i) => (
              <li key={i} className="flex gap-2 text-sm" style={{ color: "var(--fg-2)" }}>
                <span
                  className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: "var(--accent)" }}
                  aria-hidden
                />
                <span className="line-clamp-2">{r}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card p-5">
        <header className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold" style={{ color: "var(--fg)" }}>Quality scorecard</h3>
          <Pill tone="success">
            {Math.round(scores.reduce((a, b) => a + b.score, 0) / scores.length)}%
          </Pill>
        </header>
        <ul className="space-y-2.5">
          {scores.map(({ id, score }) => (
            <li key={id} className="text-xs">
              <div className="flex items-center justify-between">
                <a
                  href={`#stage-${id}`}
                  className="font-medium hover:underline"
                  style={{ color: "var(--fg-2)" }}
                >
                  {STAGE_META[id].title}
                </a>
                <span style={{ color: "var(--fg-4)" }}>{score}%</span>
              </div>
              <ProgressBar
                value={score}
                tone={score >= 70 ? "success" : score >= 40 ? "accent" : "warning"}
                className="mt-1"
              />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
