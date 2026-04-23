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
}

export interface ExperimentMeta {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  currentVersion: number;
}

export interface Experiment extends ExperimentMeta {
  versions: Version[];
}

// A pending proposal from the LLM that the user hasn't accepted yet.
export interface Proposal {
  baseVersion: number;
  triggerKind: Version["triggerKind"];
  triggerText: string;
  summary: string;
  stages: Stage[];
  // Per-stage rationale to show in the diff view.
  rationale: Partial<Record<StageId, string>>;
}
