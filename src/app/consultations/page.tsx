import Link from "next/link";
import { listConsultations, getConsultation } from "@/lib/consultation-storage";
import ScopeTabs from "@/components/ScopeTabs";
import { getCurrentUser, matchesScope, resolveScope } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ConsultationsPage({
  searchParams,
}: {
  searchParams?: { scope?: string };
}) {
  const user = getCurrentUser()!;
  const scope = resolveScope(searchParams?.scope);
  const metas = await listConsultations();
  const counts = {
    mine: metas.filter((m) => matchesScope(m.ownerEmail, user, "mine")).length,
    org: metas.filter((m) => matchesScope(m.ownerEmail, user, "org")).length,
  };
  const filteredMetas = metas.filter((m) => matchesScope(m.ownerEmail, user, scope));
  const consultations = await Promise.all(
    filteredMetas.map(async (m) => {
      const c = await getConsultation(m.id);
      return { ...m, messageCount: c?.messages.length ?? 0 };
    }),
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">M&amp;E Advisor</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--fg-3)" }}>
            One-off methodology questions answered by an M&amp;E specialist. The advisor asks
            follow-up questions when it needs more context before giving advice.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ScopeTabs scope={scope} basePath="/consultations" user={user} counts={counts} />
          <Link
            href="/consultations/new"
            className="rounded-xl px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-2))" }}
          >
            Ask a question
          </Link>
        </div>
      </div>

      {consultations.length === 0 ? (
        <div
          className="card flex flex-col items-center justify-center p-10 text-center"
          style={{ borderStyle: "dashed" }}
        >
          <p style={{ color: "var(--fg-3)" }}>
            {scope === "mine"
              ? "You haven't asked anything yet."
              : `Nothing from @${user.domain} yet.`}
          </p>
          <Link
            href="/consultations/new"
            className="mt-4 inline-block rounded-xl px-4 py-2 text-sm font-medium text-white"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-2))" }}
          >
            Ask your first question
          </Link>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {consultations.map((c) => {
            const mine = c.ownerEmail === user.email;
            return (
              <li key={c.id}>
                <Link
                  href={`/consultations/${c.id}`}
                  className="card card-hover flex h-full flex-col p-5"
                >
                  <p className="font-medium leading-snug" style={{ color: "var(--fg)" }}>{c.title}</p>
                  <div className="mt-auto flex items-center justify-between pt-3 text-xs" style={{ color: "var(--fg-4)" }}>
                    <span className="truncate">
                      {c.ownerEmail ? (mine ? "You" : c.ownerEmail) : "Unassigned"} ·{" "}
                      {Math.floor(c.messageCount / 2)} exchange{Math.floor(c.messageCount / 2) !== 1 ? "s" : ""}
                    </span>
                    <span className="whitespace-nowrap">{new Date(c.updatedAt).toLocaleDateString()}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
