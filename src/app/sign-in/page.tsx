"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ALLOWED_DOMAINS } from "@/lib/auth-shared";

function SignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params?.get("next") || "/";
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sign-in failed");
      // Hard-reload so middleware sees the new cookie.
      window.location.assign(next);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="block text-xs font-medium uppercase tracking-wide" style={{ color: "var(--fg-4)" }}>
          Work email
        </span>
        <input
          type="email"
          autoFocus
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={`you@${ALLOWED_DOMAINS[0]}`}
          className="mt-1 w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2"
          style={{
            borderColor: "var(--border)",
            background: "var(--surface)",
            color: "var(--fg)",
          }}
        />
      </label>

      {error && (
        <p
          className="rounded-lg px-3 py-2 text-xs"
          style={{ background: "var(--danger-soft)", color: "var(--danger)" }}
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-xl px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
        style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-2))" }}
      >
        {busy ? "Signing in…" : "Continue"}
      </button>

      <p className="text-center text-xs" style={{ color: "var(--fg-4)" }}>
        Access is limited to <strong>{ALLOWED_DOMAINS.join("</strong> and <strong>")}</strong> email addresses.
      </p>
    </form>
  );
}

export default function SignInPage() {
  return (
    <div
      className="flex min-h-screen items-center justify-center p-6"
      style={{ background: "var(--bg)" }}
    >
      <div className="w-full max-w-sm">
        <div className="hero-card mb-6 p-6 text-center">
          <span
            className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-2xl text-white"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v6L4 19a2 2 0 0 0 1.8 2.9h12.4A2 2 0 0 0 20 19L15 9V3M9 3h6" />
            </svg>
          </span>
          <h1 className="text-lg font-semibold tracking-tight">Experimentation Playground</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--hero-muted)" }}>
            Sign in to plan, iterate, and review experiments with your team.
          </p>
        </div>

        <div className="card p-6">
          <Suspense fallback={null}>
            <SignInForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
