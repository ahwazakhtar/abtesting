import Link from "next/link";
import { listExperiments } from "@/lib/storage";
import { listConsultations } from "@/lib/consultation-storage";
import { listDocReviews } from "@/lib/doc-review-storage";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [exps, consultations, docReviews] = await Promise.all([
    listExperiments(),
    listConsultations(),
    listDocReviews(),
  ]);
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Experiments</h1>
        <p className="mt-1 text-sm text-slate-600">
          Plans evolve. Track every version, ground every change in a reason.
        </p>
      </div>

      <details
        open={exps.length === 0}
        className="group mb-6 rounded-lg border border-slate-200 bg-white p-5 open:pb-6"
      >
        <summary className="flex cursor-pointer list-none items-center justify-between">
          <span className="font-semibold">User guide</span>
          <span className="text-xs text-slate-500 group-open:hidden">Show</span>
          <span className="hidden text-xs text-slate-500 group-open:inline">Hide</span>
        </summary>

        <div className="mt-4 space-y-4 text-sm text-slate-700">
          <p>
            This app turns an A/B test plan into a living document. You draft a first
            version from a brief, then iterate by pasting feedback or meeting notes —
            the model proposes targeted edits you review as a diff before accepting
            them as the next version.
          </p>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Workflow
            </p>
            <ol className="list-decimal space-y-1.5 pl-5">
              <li>
                <strong>Create an experiment.</strong> Click{" "}
                <em>New experiment</em>, give it a title and a short description
                (paste a concept note if you have one). The model drafts{" "}
                <strong>v1</strong> across all stages of the plan.
              </li>
              <li>
                <strong>Review the current plan.</strong> Open an experiment to see
                its latest version as a list of stages (hypothesis, design, sample,
                analysis, and so on).
              </li>
              <li>
                <strong>Iterate.</strong> Click <em>Iterate on plan</em> and paste
                feedback, meeting notes, or a manual edit request. The model returns
                a proposed revision with a summary and rationale.
              </li>
              <li>
                <strong>Accept or discard.</strong> Review the diff side-by-side.
                Accepting saves it as the next numbered version; the old version
                stays in history.
              </li>
              <li>
                <strong>Walk the history.</strong> Use the version timeline on the
                experiment page to jump to any prior version or diff two versions.
              </li>
            </ol>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Tips
            </p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                Use <em>Meeting notes</em> for raw, unstructured input — the model
                will figure out which stages to touch.
              </li>
              <li>
                Use <em>Manual edit request</em> when you know exactly what you
                want changed (e.g. &ldquo;switch the analysis to cluster-robust
                SEs&rdquo;).
              </li>
              <li>
                Every version records the trigger that produced it, so the
                &ldquo;why&rdquo; behind each change stays with the plan.
              </li>
            </ul>
          </div>
        </div>
      </details>

      {/* Quick-access panels for the other two modules */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/consultations"
          className="flex flex-col rounded-lg border border-slate-200 bg-white p-5 transition hover:border-slate-400 hover:shadow-sm"
        >
          <div className="flex items-baseline justify-between">
            <span className="font-semibold">PhD Advisor</span>
            <span className="text-xs text-slate-500">{consultations.length} sessions</span>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            One-off methodology questions — IRR setup, power, identification, mediation.
            The advisor asks follow-up questions when it needs more context.
          </p>
          <span className="mt-3 text-xs font-medium text-accent">Ask a question →</span>
        </Link>
        <Link
          href="/doc-reviews"
          className="flex flex-col rounded-lg border border-slate-200 bg-white p-5 transition hover:border-slate-400 hover:shadow-sm"
        >
          <div className="flex items-baseline justify-between">
            <span className="font-semibold">Doc Review</span>
            <span className="text-xs text-slate-500">{docReviews.length} reviews</span>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Paste a Google Doc link for a PhD-level critique of concept notes,
            protocols, analysis plans, and evaluation reports.
          </p>
          <span className="mt-3 text-xs font-medium text-accent">Review a doc →</span>
        </Link>
      </div>

      {exps.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-slate-600">No experiments yet.</p>
          <Link
            href="/experiments/new"
            className="mt-4 inline-block rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Create your first experiment
          </Link>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {exps.map((e) => (
            <li key={e.id}>
              <Link
                href={`/experiments/${e.id}`}
                className="block rounded-lg border border-slate-200 bg-white p-5 transition hover:border-slate-400 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-semibold">{e.title}</h2>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    v{e.currentVersion}
                  </span>
                </div>
                {e.description && (
                  <p className="mt-2 line-clamp-3 text-sm text-slate-600">{e.description}</p>
                )}
                <p className="mt-3 text-xs text-slate-500">
                  Updated {new Date(e.updatedAt).toLocaleDateString()}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
