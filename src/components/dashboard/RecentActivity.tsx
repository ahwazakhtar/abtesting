import Link from "next/link";
import Pill from "@/components/ui/Pill";

export interface ActivityItem {
  id: string;
  kind: "Experiment" | "Advisor" | "Doc review";
  title: string;
  updatedAt: string;
  href: string;
}

const TONE: Record<ActivityItem["kind"], "accent" | "info" | "success"> = {
  Experiment: "accent",
  Advisor: "info",
  "Doc review": "success",
};

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.round(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function RecentActivity({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) return null;
  return (
    <section className="card">
      <header
        className="flex items-center justify-between border-b px-5 py-3"
        style={{ borderColor: "var(--border)" }}
      >
        <h3 className="text-sm font-semibold" style={{ color: "var(--fg)" }}>Recent activity</h3>
      </header>
      <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
        {items.map((a) => (
          <li key={`${a.kind}-${a.id}`}>
            <Link
              href={a.href}
              className="flex items-center gap-4 px-5 py-3 transition hover:bg-[var(--surface-2)]"
            >
              <Pill tone={TONE[a.kind]}>{a.kind}</Pill>
              <span className="flex-1 truncate text-sm" style={{ color: "var(--fg)" }}>{a.title}</span>
              <span className="text-xs whitespace-nowrap" style={{ color: "var(--fg-4)" }}>{timeAgo(a.updatedAt)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
