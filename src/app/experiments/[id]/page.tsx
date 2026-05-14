import { notFound } from "next/navigation";
import { getExperiment } from "@/lib/storage";
import StageList from "@/components/StageList";
import VersionTimeline from "@/components/VersionTimeline";
import MEReviewPanel from "@/components/MEReviewPanel";
import KeyTermsSection from "@/components/KeyTermsSection";
import AssetsPane from "@/components/AssetsPane";
import CommentsSection from "@/components/CommentsSection";
import ExperimentSummaryHeader from "@/components/experiment/ExperimentSummaryHeader";
import StatHighlights from "@/components/experiment/StatHighlights";
import ScorecardRow from "@/components/experiment/ScorecardRow";
import PlanAtAGlance from "@/components/experiment/PlanAtAGlance";
import RightRail from "@/components/experiment/RightRail";

export const dynamic = "force-dynamic";

export default async function ExperimentPage({ params }: { params: { id: string } }) {
  const exp = await getExperiment(params.id);
  if (!exp) notFound();
  const current = exp.versions[exp.versions.length - 1];

  let status: "Drafting" | "Reviewing" | "Iterating" | "In progress" = "Drafting";
  if (current.meReview || current.phdReview) status = "Reviewing";
  else if (exp.currentVersion >= 3) status = "In progress";
  else if (exp.currentVersion >= 2) status = "Iterating";

  return (
    <div className="space-y-6">
      <ExperimentSummaryHeader experiment={exp} status={status} />

      <StatHighlights current={current} versionCount={exp.versions.length} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6 min-w-0">
          <ScorecardRow current={current} />

          <PlanAtAGlance current={current} />

          <section>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-base font-semibold tracking-tight" style={{ color: "var(--fg)" }}>
                Plan stages
              </h2>
              <span className="text-xs" style={{ color: "var(--fg-4)" }}>
                Current plan — v{current.number}
              </span>
            </div>
            <StageList stages={current.stages} />
          </section>

          <KeyTermsSection keyTerms={current.meReviewKeyTerms ?? []} />

          <MEReviewPanel
            experimentId={exp.id}
            versionNumber={current.number}
            initialReview={current.meReview ?? current.phdReview}
            initialReviewSimplified={current.meReviewSimplified}
            initialKeyTerms={current.meReviewKeyTerms}
          />
        </div>

        <RightRail
          versions={
            <VersionTimeline
              experimentId={exp.id}
              versions={exp.versions}
              currentVersion={exp.currentVersion}
            />
          }
          assets={
            <AssetsPane
              experimentId={exp.id}
              initialAssets={exp.assets ?? []}
              embedded
            />
          }
          comments={
            <CommentsSection
              experimentId={exp.id}
              initialComments={exp.comments ?? []}
              embedded
            />
          }
        />
      </div>
    </div>
  );
}
