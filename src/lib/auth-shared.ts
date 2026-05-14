// Edge-runtime-safe helpers (no next/headers imports).
// Used by middleware and the sign-in API.

export const ALLOWED_DOMAINS = ["taleemabad.com", "niete.edu.pk"] as const;
export const COOKIE_NAME = "playground_user";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export interface AuthedUser {
  email: string;
  domain: string;
}

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function domainFromEmail(email: string): string | null {
  const at = email.indexOf("@");
  if (at <= 0 || at === email.length - 1) return null;
  return email.slice(at + 1);
}

export function validateEmail(
  raw: string,
):
  | { ok: true; email: string; domain: string }
  | { ok: false; error: string } {
  const email = normalizeEmail(raw);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Enter a valid email address." };
  }
  const domain = domainFromEmail(email)!;
  if (!ALLOWED_DOMAINS.includes(domain as (typeof ALLOWED_DOMAINS)[number])) {
    return {
      ok: false,
      error: `Use your ${ALLOWED_DOMAINS.join(" or ")} email.`,
    };
  }
  return { ok: true, email, domain };
}

export function parseUserCookie(value: string | undefined): AuthedUser | null {
  if (!value) return null;
  const email = value.toLowerCase();
  const domain = domainFromEmail(email);
  if (!domain) return null;
  if (!ALLOWED_DOMAINS.includes(domain as (typeof ALLOWED_DOMAINS)[number])) return null;
  return { email, domain };
}
