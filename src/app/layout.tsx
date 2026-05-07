import type { Metadata } from "next";
import Link from "next/link";
import ThemeProvider from "@/components/ThemeProvider";
import DarkModeToggle from "@/components/DarkModeToggle";
import "./globals.css";

export const metadata: Metadata = {
  title: "Experimentation Playground",
  description: "Versioned, iterable AB testing plans for real-world experiments.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen" style={{ background: "var(--bg)", color: "var(--fg)" }}>
        <ThemeProvider>
          <header className="border-b" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <Link href="/" className="font-semibold tracking-tight" style={{ color: "var(--fg)" }}>
                Experimentation Playground
              </Link>
              <nav className="flex items-center gap-2 text-sm">
                <Link
                  href="/consultations"
                  className="rounded px-3 py-1.5 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                  style={{ color: "var(--fg-3)" }}
                >
                  M&amp;E Advisor
                </Link>
                <Link
                  href="/doc-reviews"
                  className="rounded px-3 py-1.5 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                  style={{ color: "var(--fg-3)" }}
                >
                  Doc Review
                </Link>
                <Link
                  href="/experiments/new"
                  className="rounded bg-accent px-3 py-1.5 text-white hover:bg-blue-700"
                >
                  New experiment
                </Link>
                <DarkModeToggle />
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
