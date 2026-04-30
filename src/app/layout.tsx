import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Experimentation Playground",
  description: "Versioned, iterable AB testing plans for real-world experiments.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-paper text-ink">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="font-semibold tracking-tight">
              Experimentation Playground
            </Link>
            <nav className="flex items-center gap-2 text-sm">
              <Link href="/consultations" className="rounded px-3 py-1.5 text-slate-600 hover:bg-slate-100">
                PhD Advisor
              </Link>
              <Link href="/doc-reviews" className="rounded px-3 py-1.5 text-slate-600 hover:bg-slate-100">
                Doc Review
              </Link>
              <Link href="/experiments/new" className="rounded bg-accent px-3 py-1.5 text-white hover:bg-blue-700">
                New experiment
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
