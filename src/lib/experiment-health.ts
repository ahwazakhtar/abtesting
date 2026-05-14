import { Version } from "./types";

function countMatches(md: string | undefined, re: RegExp): number {
  if (!md) return 0;
  const m = md.match(re);
  return m ? m.length : 0;
}

export interface ExperimentHealth {
  strengths: number;
  challenges: number;
  confidence: number;
  hasReview: boolean;
  filledStages: number;
  totalStages: number;
}

export function computeHealth(current: Version | undefined): ExperimentHealth {
  if (!current) {
    return { strengths: 0, challenges: 0, confidence: 0, hasReview: false, filledStages: 0, totalStages: 8 };
  }
  const review = current.meReview ?? current.phdReview ?? "";
  const strengths = countMatches(
    review,
    /\b(strength|well[- ]designed|solid|robust|appropriate|sound)\b/gi,
  );
  const challenges = countMatches(
    review,
    /\b(risk|concern|weak|threat|limitation|caveat|issue|gap)\b/gi,
  );
  const total = current.stages.length || 8;
  const filled = current.stages.filter((s) => (s.content ?? "").trim().length > 0).length;
  const confidence = review
    ? Math.max(20, Math.min(95, Math.round((filled / total) * 100) - challenges * 3 + strengths * 2))
    : Math.round((filled / total) * 60);
  return {
    strengths,
    challenges,
    confidence,
    hasReview: !!review,
    filledStages: filled,
    totalStages: total,
  };
}
