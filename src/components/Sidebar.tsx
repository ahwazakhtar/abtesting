"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { AuthedUser } from "@/lib/auth";
import SignOutButton from "./SignOutButton";

interface SidebarItem {
  href: string;
  label: string;
  icon: ReactNode;
  match: (pathname: string) => boolean;
}

const ITEMS: SidebarItem[] = [
  {
    href: "/",
    label: "Dashboard",
    match: (p) => p === "/",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12 12 4l9 8M5 10v10h14V10" />
      </svg>
    ),
  },
  {
    href: "/experiments",
    label: "Experiments",
    match: (p) => p === "/experiments" || p.startsWith("/experiments/"),
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v6L4 19a2 2 0 0 0 1.8 2.9h12.4A2 2 0 0 0 20 19L15 9V3M9 3h6M9 14h6" />
      </svg>
    ),
  },
  {
    href: "/consultations",
    label: "M&E Advisor",
    match: (p) => p.startsWith("/consultations"),
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    ),
  },
  {
    href: "/doc-reviews",
    label: "Doc Review",
    match: (p) => p.startsWith("/doc-reviews"),
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M9 13h6 M9 17h4" />
      </svg>
    ),
  },
  {
    href: "/experiments/digital-coach-promotion/analytics",
    label: "Analytics",
    match: (p) => p.endsWith("/analytics"),
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18 M7 15l4-4 4 4 5-7" />
      </svg>
    ),
  },
];

export default function Sidebar({ user }: { user: AuthedUser }) {
  const pathname = usePathname() ?? "/";
  const initial = user.email.charAt(0).toUpperCase();

  return (
    <aside
      className="hidden lg:flex fixed inset-y-0 left-0 w-60 flex-col border-r"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <Link href="/" className="flex h-16 items-center gap-2 px-5">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-xl text-white"
          style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-2))" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v6L4 19a2 2 0 0 0 1.8 2.9h12.4A2 2 0 0 0 20 19L15 9V3M9 3h6" />
          </svg>
        </span>
        <span className="text-sm font-semibold tracking-tight" style={{ color: "var(--fg)" }}>
          Experimentation
          <span className="block text-xs font-normal" style={{ color: "var(--fg-4)" }}>
            Playground
          </span>
        </span>
      </Link>

      <nav className="flex-1 px-3 py-2">
        <ul className="space-y-1">
          {ITEMS.map((it) => {
            const active = it.match(pathname);
            return (
              <li key={it.href}>
                <Link
                  href={it.href}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition"
                  style={
                    active
                      ? { background: "var(--accent-soft)", color: "var(--accent)" }
                      : { color: "var(--fg-3)" }
                  }
                >
                  <span style={active ? { color: "var(--accent)" } : { color: "var(--fg-4)" }}>
                    {it.icon}
                  </span>
                  {it.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div
        className="m-3 flex items-center gap-3 rounded-xl border p-3"
        style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}
      >
        <span
          className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white"
          style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-2))" }}
        >
          {initial}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold" style={{ color: "var(--fg)" }} title={user.email}>
            {user.email.split("@")[0]}
          </p>
          <p className="truncate text-xs" style={{ color: "var(--fg-4)" }}>@{user.domain}</p>
        </div>
        <SignOutButton />
      </div>
    </aside>
  );
}
