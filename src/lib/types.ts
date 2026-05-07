// Core data types for the AB testing tracker.
//
// An Experiment is the top-level entity (e.g. "Digital Coach Promotion Study").
// Each Experiment has an ordered list of Stages — one row per phase of the
// AB-testing pipeline. The plan evolves through Versions: every accepted
// proposal produces a new Version (a full snapshot of all stages), so we can
// always diff v1 -> v2 -> v3.

export type StageId =
  | "hypothesis"
  | "research_questions"
  | "design"
  | "power"
  | "measurement"
  | "analysis"
  | "results"
  | "postmortem";

export const STAGE_ORDER: StageId[] = [
  "hypothesis",
  "research_questions",
  "design",
  "power",
  "measurement",
  "analysis",
  "results",
  "postmortem",
];

export const STAGE_META: Record<StageId, { title: string; blurb: string }> = {
  hypothesis: {
    title: "Hypothesis",
    blurb: "What you believe and why. The behavior change you're trying to cause.",
  },
  research_questions: {
    title: "Research Questions",
    blurb: "Primary and secondary questions the experiment must answer.",
  },
  design: {
    title: "Design & Sampling",
    blurb: "Arms, units of randomization, sampling frame, stratification, recruitment.",
  },
  power: {
    title: "Power & MDE",
    blurb: "Minimum detectable effect, sample size calculations, assumptions.",
  },
  measurement: {
    title: "Measurement Plan",
    blurb: "Outcomes, instruments, data collection mechanics, IRR.",
  },
  analysis: {
    title: "Analysis Plan",
    blurb: "Pre-registered comparisons, models, subgroup and robustness checks.",
  },
  results: {
    title: "Results",
    blurb: "Findings as they come in. Updated as data lands.",
  },
  postmortem: {
    title: "Post-mortem & Learnings",
    blurb: "What you'd do differently. Lessons for the next experiment.",
  },
};

export interface Stage {
  id: StageId;
  // Markdown body. Free-form so the LLM and user can write naturally.
  content: string;
}

export interface Version {
  number: number; // 1-indexed
  createdAt: string; // ISO
  // Why this version exists. Either the user's feedback verbatim, the meeting
  // notes they pasted, or an "initial draft" marker for v1.
  triggerKind: "initial" | "feedback" | "meeting_notes" | "manual_edit";
  triggerText: string;
  // Short LLM-written summary of what changed and why.
  summary: string;
  stages: Stage[];
  // M&E Review — technical critique, generated on demand.
  meReview?: string;
  // Plain-language explanation of the review for a non-economist audience.
  meReviewSimplified?: string;
  // Up to 3 key methods/terms extracted from the review, for non-specialists.
  meReviewKeyTerms?: KeyTerm[];
  // Legacy field kept for backward compat with existing stored data.
  phdReview?: string;
}

// ─── Key Terms ───────────────────────────────────────────────────────────────

export interface KeyTerm {
  term: string;       // e.g. "Randomization"
  definition: string; // one sentence, jargon-free
}

// ─── Assets ──────────────────────────────────────────────────────────────────

export interface Asset {
  id: string;
  label: string;   // e.g. "Survey instrument", "Pre-analysis plan"
  url: string;     // Google Doc, Drive, etc.
  addedAt: string; // ISO
}

// ─── Comments ─────────────────────────────────────────────────────────────────

export interface Comment {
  id: string;
  authorName: string;
  content: string;      // May contain @mention syntax
  mentions: string[];   // Extracted @usernames
  createdAt: string;    // ISO
}

export interface ExperimentMeta {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  currentVersion: number;
  assets?: Asset[];
  comments?: Comment[];
}

export interface Experiment extends ExperimentMeta {
  versions: Version[];
}

// ─── Consultation (M&E Advisor) ───────────────────────────────────────────────

export interface ConsultationMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  editedAt?: string; // set when manually edited
}

export interface ConsultationMeta {
  id: string;
  title: string; // auto-derived from first user message
  createdAt: string;
  updatedAt: string;
}

export interface Consultation extends ConsultationMeta {
  messages: ConsultationMessage[];
}

// ─── Doc Review ───────────────────────────────────────────────────────────────

export interface DocReviewVersion {
  review: string;
  reviewSimplified?: string;
  reviewKeyTerms?: KeyTerm[];
  feedback: string; // what triggered this version
  createdAt: string;
}

export interface DocReviewMeta {
  id: string;
  docUrl: string;
  docTitle: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocReview extends DocReviewMeta {
  docContent: string;
  review: string;              // M&E critique, editable
  reviewSimplified?: string;   // Plain-language explanation
  reviewKeyTerms?: KeyTerm[];  // Up to 3 key terms for non-specialists
  history?: DocReviewVersion[];
}
export interface Proposal {
  baseVersion: number;
  triggerKind: Version["triggerKind"];
  triggerText: string;
  summary: string;
  stages: Stage[];
  // Per-stage rationale to show in the diff view.
  rationale: Partial<Record<StageId, string>>;
}
