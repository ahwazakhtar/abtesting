"use client";

import { useState } from "react";

export default function SignOutButton() {
  const [busy, setBusy] = useState(false);
  async function signOut() {
    setBusy(true);
    try {
      await fetch("/api/auth/sign-out", { method: "POST" });
    } finally {
      window.location.assign("/sign-in");
    }
  }
  return (
    <button
      type="button"
      onClick={signOut}
      disabled={busy}
      className="ml-auto rounded-lg p-1.5 transition hover:bg-[var(--surface-3)] disabled:opacity-60"
      title="Sign out"
      aria-label="Sign out"
      style={{ color: "var(--fg-4)" }}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9" />
      </svg>
    </button>
  );
}
