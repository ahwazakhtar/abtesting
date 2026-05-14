import Link from "next/link";
import { AuthedUser, Scope } from "@/lib/auth";

interface Props {
  scope: Scope;
  basePath: string;
  user: AuthedUser;
  counts?: { mine: number; org: number };
  extraQuery?: Record<string, string | undefined>;
}

function withParams(base: string, params: Record<string, string | undefined>): string {
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v as string)}`)
    .join("&");
  return qs ? `${base}?${qs}` : base;
}

export default function ScopeTabs({ scope, basePath, user, counts, extraQuery }: Props) {
  const tabs: { key: Scope; label: string; hint: string; count?: number }[] = [
    { key: "mine", label: "Mine", hint: user.email, count: counts?.mine },
    { key: "org", label: "Organization", hint: `@${user.domain}`, count: counts?.org },
  ];

  return (
    <div
      className="inline-flex items-center gap-1 rounded-xl border p-1"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      role="tablist"
    >
      {tabs.map((t) => {
        const active = scope === t.key;
        const href = withParams(basePath, { ...extraQuery, scope: t.key });
        return (
          <Link
            key={t.key}
            href={href}
            role="tab"
            aria-selected={active}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition"
            style={
              active
                ? { background: "var(--accent-soft)", color: "var(--accent)" }
                : { color: "var(--fg-3)" }
            }
          >
            {t.label}
            {typeof t.count === "number" && (
              <span
                className="rounded-full px-1.5 text-[10px] font-semibold"
                style={
                  active
                    ? { background: "var(--accent)", color: "white" }
                    : { background: "var(--surface-2)", color: "var(--fg-4)" }
                }
              >
                {t.count}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
