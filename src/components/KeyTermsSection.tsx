import { KeyTerm } from "@/lib/types";

interface Props {
  keyTerms: KeyTerm[];
}

export default function KeyTermsSection({ keyTerms }: Props) {
  if (keyTerms.length === 0) return null;

  return (
    <section
      className="mt-5 rounded-lg border p-5"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <h2 className="mb-4 text-lg font-semibold tracking-tight">Key Methods &amp; Terms</h2>
      <p className="mb-4 text-sm" style={{ color: "var(--fg-3)" }}>
        The M&amp;E review for this experiment uses the following concepts. Here is what
        each one means in plain language.
      </p>
      <dl className="space-y-4">
        {keyTerms.map((t, i) => (
          <div key={t.term} className="flex gap-4">
            <span
              className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ background: "var(--accent, #2563eb)" }}
            >
              {i + 1}
            </span>
            <div>
              <dt className="text-sm font-semibold">{t.term}</dt>
              <dd className="mt-1 text-sm" style={{ color: "var(--fg-3)" }}>{t.definition}</dd>
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
}
