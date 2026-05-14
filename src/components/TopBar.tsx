"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import DarkModeToggle from "./DarkModeToggle";

function titleFor(pathname: string): { label: string; href?: string }[] {
  if (pathname === "/") return [{ label: "Dashboard" }];
  if (pathname.startsWith("/experiments/new")) return [{ label: "Experiments", href: "/" }, { label: "New" }];
  if (pathname.startsWith("/experiments")) {
    const parts = pathname.split("/").filter(Boolean);
    const crumbs: { label: string; href?: string }[] = [{ label: "Experiments", href: "/" }];
    if (parts[1]) crumbs.push({ label: "Detail" });
    if (parts[2] === "iterate") crumbs.push({ label: "Iterate" });
    if (parts[2] === "diff") crumbs.push({ label: "Diff" });
    if (parts[2] === "analytics") crumbs.push({ label: "Analytics" });
    return crumbs;
  }
  if (pathname.startsWith("/consultations")) return [{ label: "M&E Advisor" }];
  if (pathname.startsWith("/doc-reviews")) return [{ label: "Doc Review" }];
  return [{ label: "Dashboard" }];
}

export default function TopBar() {
  const pathname = usePathname() ?? "/";
  const crumbs = titleFor(pathname);

  return (
    <div
      className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b px-6 backdrop-blur"
      style={{ borderColor: "var(--border)", background: "color-mix(in srgb, var(--bg) 85%, transparent)" }}
    >
      <nav className="flex items-center gap-2 text-sm min-w-0">
        {crumbs.map((c, i) => (
          <span key={i} className="flex items-center gap-2 min-w-0">
            {i > 0 && (
              <span style={{ color: "var(--fg-4)" }} aria-hidden>/</span>
            )}
            {c.href ? (
              <Link
                href={c.href}
                className="truncate hover:underline"
                style={{ color: "var(--fg-3)" }}
              >
                {c.label}
              </Link>
            ) : (
              <span className="truncate font-medium" style={{ color: "var(--fg)" }}>{c.label}</span>
            )}
          </span>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <div
          className="hidden md:flex h-9 items-center gap-2 rounded-xl border px-3 text-sm"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4" style={{ color: "var(--fg-4)" }}>
            <circle cx={11} cy={11} r={7} />
            <path strokeLinecap="round" d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="search"
            placeholder="Search experiments…"
            className="w-56 bg-transparent text-sm focus:outline-none"
            style={{ color: "var(--fg)" }}
          />
        </div>
        <Link
          href="/experiments/new"
          className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
          style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-2))" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
            <path strokeLinecap="round" d="M12 5v14M5 12h14" />
          </svg>
          New experiment
        </Link>
        <DarkModeToggle />
      </div>
    </div>
  );
}
