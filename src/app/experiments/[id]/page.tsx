import Link from "next/link";
import { notFound } from "next/navigation";
import { getExperiment } from "@/lib/storage";
import StageList from "@/components/StageList";
import VersionTimeline from "@/components/VersionTimeline";
import MEReviewPanel from "@/components/MEReviewPanel";
import KeyTermsSection from "@/components/KeyTermsSection";
import AssetsPane from "@/components/AssetsPane";
import CommentsSection from "@/components/CommentsSection";

export const dynamic = "force-dynamic";

export default async function ExperimentPage({ params }: { params: { id: string } }) {
  const exp = await getExperiment(params.id);
  if (!exp) notFound();
  const current = exp.versions[exp.versions.length - 1];

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div>
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <div>
            <Link href="/" className="text-xs hover:underline" style={{ color: "var(--fg-4)" }}>
              ← All experiments
            </Link>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">{exp.title}</h1>
            {exp.description && (
              <p className="mt-1 max-w-2xl text-sm" style={{ color: "var(--fg-3)" }}>
                {exp.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {exp.id === "digital-coach-promotion" && (
              <Link
                href={`/experiments/${exp.id}/analytics`}
                className="rounded border px-3 py-2 text-sm font-medium transition hover:opacity-80"
                style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--fg-2)" }}
              >
                Live analytics
              </Link>
            )}
            <Link
              href={`/experiments/${exp.id}/iterate`}
              className="rounded bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Iterate on plan
            </Link>
          </div>
        </div>

        <div className="mb-3 text-xs uppercase tracking-wide" style={{ color: "var(--fg-4)" }}>
          Current plan — v{current.number}
        </div>

        <StageList stages={current.stages} />

        {/* Key terms appear after the postmortem stage if a review has been run */}
        <KeyTermsSection keyTerms={current.meReviewKeyTerms ?? []} />

        <MEReviewPanel
          experimentId={exp.id}
          versionNumber={current.number}
          initialReview={current.meReview ?? current.phdReview}
          initialReviewSimplified={current.meReviewSimplified}
          initialKeyTerms={current.meReviewKeyTerms}
        />

        <AssetsPane
          experimentId={exp.id}
          initialAssets={exp.assets ?? []}
        />

        <CommentsSection
          experimentId={exp.id}
          initialComments={exp.comments ?? []}
        />
      </div>

      <aside>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--fg-4)" }}>
          Version history
        </h2>
        <VersionTimeline
          experimentId={exp.id}
          versions={exp.versions}
          currentVersion={exp.currentVersion}
        />
      </aside>
    </div>
  );
}
