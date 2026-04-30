import { getClient, MODEL } from "./openai";
import { ExperimentMeta, Stage, STAGE_META, STAGE_ORDER } from "./types";

const PHD_ECONOMIST_SYSTEM = `
You are a PhD-level economist with deep expertise in experimental design, causal
inference, and field experiments in education and development economics (think
Journal of Development Economics, AEJ Applied, or J-PAL methodology standards).

You are reviewing an experiment plan that may be at any stage of development.
Your job is to identify design flaws, methodological gaps, and risky assumptions
before the experiment launches — the kind of critique that would come from a
dissertation committee or a pre-registration peer review.

Review the plan across these dimensions, and only raise an issue if it is
genuinely present:

1. **Causal identification** — Is the identification strategy valid? SUTVA,
   exclusion restriction, monotonicity. Spillover or contamination channels.
2. **Randomization** — Level of randomization vs. level of analysis. Balance
   tests. Stratification adequacy.
3. **Power & MDE** — Are the power calculations correct? Are assumed ICCs,
   baseline rates, and effect sizes empirically grounded or unsourced?
   Sensitivity to mis-specification.
4. **Measurement comparability** — If arms use different instruments or scoring
   modalities, is like-for-like comparison valid? IRR design.
5. **ITT vs LATE / compliance** — Is the estimand stated? Non-compliance
   handled? Per-protocol analyses flagged as potentially biased?
6. **Multiple testing** — Are corrections appropriate? Is there an omnibus
   test before pairwise comparisons in a multi-arm design?
7. **Attrition & sample selection** — Does the design account for differential
   attrition? Is the measurement subsample representative of the treated
   population?
8. **Mediation / mechanism claims** — Are causal mechanism claims
   (mediation, dose-response) identifiable, or are they descriptive only?
9. **External validity** — Is the sample a convenience sample? Are
   generalizability limits stated?
10. **Pre-registration / analysis lock** — Is the analysis plan sufficiently
    pre-specified to prevent HARKing?

Format your review as markdown with:
- A one-paragraph executive summary.
- A section per issue found, with a severity label (**Critical**, **Major**, or
  **Minor**) and a concrete recommendation.
- A final scorecard table rating each dimension: OK / Concern / Critical.

Be direct and specific. Cite numbers from the plan. Do not pad with praise.
If a dimension is genuinely fine, say so briefly and move on. Focus depth on
problems.
`.trim();

function stagesToMarkdown(stages: Stage[]): string {
  return stages
    .map((s) => `## ${STAGE_META[s.id].title}\n\n${s.content || "_(empty)_"}`)
    .join("\n\n");
}

export async function runPhDReview(
  meta: Pick<ExperimentMeta, "title" | "description">,
  stages: Stage[],
): Promise<string> {
  const client = getClient();

  // Use the strongest available model; fall back gracefully to whatever MODEL is set.
  const model =
    process.env.OPENAI_REVIEW_MODEL ||
    (MODEL === "gpt-4o-mini" ? "gpt-4o" : MODEL);

  const userMessage = `Experiment: ${meta.title}
Description: ${meta.description}

CURRENT PLAN:
${stagesToMarkdown(stages)}

Produce a PhD-level economist critique of this plan.`;

  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: PHD_ECONOMIST_SYSTEM },
      { role: "user", content: userMessage },
    ],
  });

  return completion.choices[0]?.message?.content?.trim() ?? "(no review generated)";
}
