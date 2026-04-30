import Link from "next/link";
import { listDocReviews } from "@/lib/doc-review-storage";

export const dynamic = "force-dynamic";

export default async function DocReviewsPage() {
  const reviews = await listDocReviews();

  return (
    <div>
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Doc Review</h1>
          <p className="mt-1 text-sm text-slate-600">
            Paste a Google Doc link for a PhD-level methodology critique. Works on concept
            notes, study protocols, analysis plans, and evaluation reports.
          </p>
        </div>
        <Link
          href="/doc-reviews/new"
          className="shrink-0 rounded bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Review a doc
        </Link>
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-slate-600">No reviews yet.</p>
          <Link
            href="/doc-reviews/new"
            className="mt-4 inline-block rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Review your first doc
          </Link>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {reviews.map((r) => (
            <li key={r.id}>
              <Link
                href={`/doc-reviews/${r.id}`}
                className="block rounded-lg border border-slate-200 bg-white p-5 transition hover:border-slate-400 hover:shadow-sm"
              >
                <p className="font-medium leading-snug">{r.docTitle}</p>
                <p className="mt-1 truncate text-xs text-slate-400">{r.docUrl}</p>
                <p className="mt-3 text-xs text-slate-500">
                  {new Date(r.updatedAt).toLocaleDateString()}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
