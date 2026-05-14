import Link from "next/link";
import { listDocReviews } from "@/lib/doc-review-storage";
import ScopeTabs from "@/components/ScopeTabs";
import { getCurrentUser, matchesScope, resolveScope } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DocReviewsPage({
  searchParams,
}: {
  searchParams?: { scope?: string };
}) {
  const user = getCurrentUser()!;
  const scope = resolveScope(searchParams?.scope);
  const all = await listDocReviews();
  const counts = {
    mine: all.filter((r) => matchesScope(r.ownerEmail, user, "mine")).length,
    org: all.filter((r) => matchesScope(r.ownerEmail, user, "org")).length,
  };
  const reviews = all.filter((r) => matchesScope(r.ownerEmail, user, scope));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Doc Review</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--fg-3)" }}>
            Paste a Google Doc link for an M&amp;E methodology critique. Works on concept
            notes, study protocols, analysis plans, and evaluation reports.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ScopeTabs scope={scope} basePath="/doc-reviews" user={user} counts={counts} />
          <Link
            href="/doc-reviews/new"
            className="rounded-xl px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-2))" }}
          >
            Review a doc
          </Link>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div
          className="card flex flex-col items-center justify-center p-10 text-center"
          style={{ borderStyle: "dashed" }}
        >
          <p style={{ color: "var(--fg-3)" }}>
            {scope === "mine"
              ? "You haven't reviewed any docs yet."
              : `Nothing from @${user.domain} yet.`}
          </p>
          <Link
            href="/doc-reviews/new"
            className="mt-4 inline-block rounded-xl px-4 py-2 text-sm font-medium text-white"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-2))" }}
          >
            Review your first doc
          </Link>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {reviews.map((r) => {
            const mine = r.ownerEmail === user.email;
            return (
              <li key={r.id}>
                <Link
                  href={`/doc-reviews/${r.id}`}
                  className="card card-hover block h-full p-5"
                >
                  <p className="font-medium leading-snug" style={{ color: "var(--fg)" }}>{r.docTitle}</p>
                  <p className="mt-1 truncate text-xs" style={{ color: "var(--fg-4)" }}>{r.docUrl}</p>
                  <div className="mt-3 flex items-center justify-between text-xs" style={{ color: "var(--fg-4)" }}>
                    <span className="truncate">
                      {r.ownerEmail ? (mine ? "You" : r.ownerEmail) : "Unassigned"}
                    </span>
                    <span className="whitespace-nowrap">{new Date(r.updatedAt).toLocaleDateString()}</span>
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
