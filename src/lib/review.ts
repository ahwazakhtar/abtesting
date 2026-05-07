import { getClient, MODEL } from "./openai";
import { ExperimentMeta, KeyTerm, Stage, STAGE_META } from "./types";

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

Return your response in THREE sections, separated by exact separator strings.

━━━ SECTION 1: Technical M&E Review (for the experiment team) ━━━
Separated from section 2 by the string: ---SIMPLIFIED---

Format as markdown with:
- A one-paragraph executive summary.
- A section per issue found, with a severity label (**Critical**, **Major**, or
  **Minor**) and a concrete recommendation.
- A final scorecard table rating each dimension: OK / Concern / Critical.
Be direct and specific. Cite numbers from the plan. Do not pad with praise.

━━━ SECTION 2: Plain-Language Explanation ━━━
Separated from section 3 by the string: ---KEYTERMS---

Write 3–5 short paragraphs explaining what the M&E Review found in plain English.
Assume the reader understands the project context but has no economics background.
Avoid jargon; when you must use one of the 3 key terms (which you will list in
section 3), use it naturally and briefly note what it means in parentheses.
Focus on: what the experiment is trying to do, what the main concerns are, and
what it would mean if they are not addressed.

━━━ SECTION 3: Key Terms ━━━
Output valid JSON only — an array of exactly 3 objects. Pick the 3 methods or
concepts from YOUR review that are most important for a non-specialist to
understand. Each object has two string fields:
  "term"       — the name of the method or concept (4 words or fewer)
  "definition" — one clear sentence a non-specialist can understand

Example format:
[{"term":"Randomization","definition":"Assigning participants to groups by chance so neither group is systematically different at the start."},{"term":"Statistical power","definition":"The experiment's ability to detect a real effect if one truly exists; too little power means real improvements go undetected."},{"term":"Intent-to-treat","definition":"Measuring outcomes for everyone originally assigned to a group, even those who did not fully participate, to reflect real-world conditions."}]
`.trim();

function stagesToMarkdown(stages: Stage[]): string {
  return stages
    .map((s) => `## ${STAGE_META[s.id].title}\n\n${s.content || "_(empty)_"}`)
    .join("\n\n");
}

function parseKeyTerms(raw: string): KeyTerm[] {
  try {
    const parsed = JSON.parse(raw.trim());
    if (Array.isArray(parsed)) {
      return parsed.slice(0, 3).map((t) => ({
        term: String(t.term ?? ""),
        definition: String(t.definition ?? ""),
      }));
    }
  } catch {
    // fall through to empty
  }
  return [];
}

export async function runMEReview(
  meta: Pick<ExperimentMeta, "title" | "description">,
  stages: Stage[],
): Promise<{ technical: string; simplified: string; keyTerms: KeyTerm[] }> {
  const client = getClient();

  const model =
    process.env.OPENAI_REVIEW_MODEL ||
    (MODEL === "gpt-4o-mini" ? "gpt-4o" : MODEL);

  const userMessage = `Experiment: ${meta.title}
Description: ${meta.description}

CURRENT PLAN:
${stagesToMarkdown(stages)}

Produce the M&E review in the three-section format described.`;

  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: ME_REVIEW_SYSTEM },
      { role: "user", content: userMessage },
    ],
  });

  const raw = completion.choices[0]?.message?.content?.trim() ?? "";
  const [techPart, rest] = raw.split("---SIMPLIFIED---");
  const [simplePart, keyTermsPart] = (rest ?? "").split("---KEYTERMS---");

  return {
    technical: techPart?.trim() || raw,
    simplified: simplePart?.trim() || "(No plain-language explanation generated.)",
    keyTerms: parseKeyTerms(keyTermsPart ?? ""),
  };
}
