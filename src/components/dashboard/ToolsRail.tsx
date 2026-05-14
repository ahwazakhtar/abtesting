import Link from "next/link";

interface ToolCard {
  href: string;
  title: string;
  description: string;
  count: number;
  cta: string;
  accent: string;
}

export default function ToolsRail({ tools }: { tools: ToolCard[] }) {
  return (
    <section className="card">
      <header
        className="flex items-center justify-between border-b px-5 py-3"
        style={{ borderColor: "var(--border)" }}
      >
        <h3 className="text-sm font-semibold" style={{ color: "var(--fg)" }}>Your tools</h3>
      </header>
      <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
        {tools.map((t) => (
          <li key={t.href}>
            <Link
              href={t.href}
              className="flex items-start gap-3 px-5 py-4 transition hover:bg-[var(--surface-2)]"
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
                style={{ background: t.accent }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-5 w-5">
                  <circle cx={12} cy={12} r={3} />
                  <circle cx={12} cy={12} r={9} strokeOpacity={0.35} />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-semibold" style={{ color: "var(--fg)" }}>{t.title}</p>
                  <span className="text-xs" style={{ color: "var(--fg-4)" }}>{t.count}</span>
                </div>
                <p className="mt-0.5 text-xs" style={{ color: "var(--fg-3)" }}>{t.description}</p>
                <span className="mt-2 inline-block text-xs font-medium" style={{ color: "var(--accent)" }}>
                  {t.cta} →
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
