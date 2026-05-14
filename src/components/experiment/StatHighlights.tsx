import { Version } from "@/lib/types";
import StatTile from "@/components/ui/StatTile";

interface Props {
  current: Version;
  versionCount: number;
}

function countMatches(md: string | undefined, re: RegExp): number {
  if (!md) return 0;
  const m = md.match(re);
  return m ? m.length : 0;
}

export default function StatHighlights({ current, versionCount }: Props) {
  const reviewText = current.meReview ?? current.phdReview ?? "";
  const strengthsHits =
    countMatches(reviewText, /\b(strength|well[- ]designed|solid|robust|appropriate|sound)\b/gi);
  const challengesHits =
    countMatches(reviewText, /\b(risk|concern|weak|threat|limitation|caveat|issue|gap)\b/gi);

  const totalStages = current.stages.length || 8;
  const filled = current.stages.filter((s) => (s.content ?? "").trim().length > 0).length;
  const confidence = reviewText
    ? Math.max(20, Math.min(95, Math.round((filled / totalStages) * 100) - challengesHits * 3 + strengthsHits * 2))
    : Math.round((filled / totalStages) * 60);

  const initialAssessment = reviewText
    ? "Reviewed"
    : versionCount === 1
      ? "Initial draft"
      : "In iteration";

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatTile
        label="Initial assessment"
        value={initialAssessment}
        hint={reviewText ? "M&E review available" : "Generate review below"}
        accent="violet"
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 11l3 3 8-8M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        }
      />
      <StatTile
        label="Key strengths"
        value={strengthsHits || "—"}
        hint="Detected in latest review"
        accent="emerald"
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
          </svg>
        }
      />
      <StatTile
        label="Key challenges"
        value={challengesHits || "—"}
        hint="Risks flagged by reviewer"
        accent="rose"
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          </svg>
        }
      />
      <StatTile
        label="Plan confidence"
        value={`${confidence}%`}
        hint={`${filled}/${totalStages} stages filled`}
        accent="indigo"
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0z M12 7v5l3 2" />
          </svg>
        }
      />
    </div>
  );
}
