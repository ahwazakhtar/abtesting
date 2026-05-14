// Server-side auth helpers. Uses next/headers — not safe for Edge middleware.

import { cookies } from "next/headers";
import { COOKIE_NAME, parseUserCookie, AuthedUser } from "./auth-shared";

export function getCurrentUser(): AuthedUser | null {
  const c = cookies().get(COOKIE_NAME);
  return parseUserCookie(c?.value);
}

export function requireUser(): AuthedUser {
  const u = getCurrentUser();
  if (!u) throw new Error("Not authenticated");
  return u;
}

export type Scope = "mine" | "org";

export function resolveScope(raw: string | string[] | undefined): Scope {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return v === "org" ? "org" : "mine";
}

/**
 * Filter an item by current scope.
 * - "mine": item.ownerEmail === user.email
 * - "org": item.ownerEmail's domain === user.domain (or ownerEmail is undefined → legacy, shown to org)
 */
export function matchesScope(
  ownerEmail: string | undefined,
  user: AuthedUser,
  scope: Scope,
): boolean {
  if (scope === "mine") return ownerEmail === user.email;
  if (!ownerEmail) return true; // legacy / unassigned
  const at = ownerEmail.indexOf("@");
  return at > 0 && ownerEmail.slice(at + 1) === user.domain;
}

export { COOKIE_NAME, ALLOWED_DOMAINS, validateEmail } from "./auth-shared";
export type { AuthedUser } from "./auth-shared";
