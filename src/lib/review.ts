import { getClient, MODEL } from "./openai";
import { ExperimentMeta, Stage, STAGE_META } from "./types";

const ME_REVIEW_SYSTEM = `
You are a senior M&E (Monitoring & Evaluation) specialist with deep expertise in
experimental design, causal inference, and field experiments in education and
development economics (J-PAL methodology standards, 3ie, IPA best practices).

You are reviewing an experiment plan. Your job is to identify design flaws,
methodological gaps, and risky assumptions — the kind of critique that would
come from a pre-registration peer review or a rigorous M&E quality assurance
process.

Review the plan across these dimensions, and only raise an issue if it is
genuinely present:

1. **Causal identification** — Is the identification strategy valid? SUTVA,
   exclusion restriction, monotonicity. Spillover or contamination channels.
2. **Randomization** — Level of randomization vs. level of analysis. Balance
   tests. Stratification adequacy.
3. **Power & MDE** — Are the power calculations correct? Are assumed ICCs,
   baseline rates, and effect sizes empirically grounded or unsourced?
4. **Measurement comparability** — If arms use different instruments or scoring
   modalities, is like-for-like comparison valid? IRR design.
5. **ITT vs LATE / compliance** — Is the estimand stated? Non-compliance handled?
6. **Multiple testing** — Are corrections appropriate? Omnibus test before pairwise
   comparisons in a multi-arm design?
7. **Attrition & sample selection** — Differential attrition? Measurement subsample
   representative of treated population?
8. **Mediation / mechanism claims** — Are causal mechanism claims identifiable?
9. **External validity** — Sample representativeness, generalizability limits stated?
10. **Pre-registration / analysis lock** — Is the analysis plan sufficiently
    pre-specified to prevent HARKing?

Return your response in TWO sections separated exactly by the string "---SIMPLIFIED---".

Section 1 — Technical M&E Review (for the experiment team):
Format as markdown with:
- A one-paragraph executive summary.
- A section per issue found, with a severity label (**Critical**, **Major**, or
  **Minor**) and a concrete recommendation.
- A final scorecard table rating each dimension: OK / Concern / Critical.
Be direct and specific. Cite numbers from the plan. Do not pad with praise.

Section 2 — Plain-Language Explanation (for stakeholders not trained in economics):
Write 3–5 short paragraphs explaining what the M&E Review found, in plain English.
Assume the reader understands the project context but has no economics background.
Avoid jargon; if you must use a technical term, define it immediately. Focus on:
what the experiment is trying to do, what the main concerns are (if any), and
what it would mean if the concerns are not addressed. Keep it accessible and
honest — do not over-reassure.
`.trim();

function stagesToMarkdown(stages: Stage[]): string {
  return stages
    .map((s) => `## ${STAGE_META[s.id].title}\n\n${s.content || "_(empty)_"}`)
    .join("\n\n");
}

export async function runMEReview(
  meta: Pick<ExperimentMeta, "title" | "description">,
  stages: Stage[],
): Promise<{ technical: string; simplified: string }> {
  const client = getClient();

  const model =
    process.env.OPENAI_REVIEW_MODEL ||
    (MODEL === "gpt-4o-mini" ? "gpt-4o" : MODEL);

  const userMessage = `Experiment: ${meta.title}
Description: ${meta.description}

CURRENT PLAN:
${stagesToMarkdown(stages)}

Produce the M&E review in the two-section format described.`;

  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: ME_REVIEW_SYSTEM },
      { role: "user", content: userMessage },
    ],
  });

  const raw = completion.choices[0]?.message?.content?.trim() ?? "";
  const parts = raw.split("---SIMPLIFIED---");
  return {
    technical: parts[0]?.trim() || raw,
    simplified: parts[1]?.trim() || "(No plain-language explanation generated.)",
  };
}
