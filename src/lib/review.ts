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
Do NOT include any section heading, label, or title in your output — just the content.

Write the technical review first, then the separator ---SIMPLIFIED---, then the plain-language explanation, then the separator ---KEYTERMS---, then the JSON array.

Technical review format (markdown):
- A one-paragraph executive summary.
- A section per issue found, with a severity label (**Critical**, **Major**, or
  **Minor**) and a concrete recommendation.
- A final scorecard table rating each dimension: OK / Concern / Critical.
Be direct and specific. Cite numbers from the plan. Do not pad with praise.

Plain-language explanation: 3–5 short paragraphs in plain English for someone
with no economics background. Avoid jargon; when you must use one of the 3 key
terms (from the JSON below), use it naturally with a brief parenthetical definition.
Focus on: what the experiment is trying to do, what the main concerns are, and
what it would mean if they are not addressed.

Key terms: valid JSON only — an array of exactly 3 objects. Pick the 3 methods or
concepts from YOUR review most important for a non-specialist. Each object:
  "term"       — the name of the method or concept (4 words or fewer)
  "definition" — exactly 3 plain-English sentences: what it is, why it matters
                 in this context, and what goes wrong if it is not done correctly

Example format:
[{"term":"Randomization","definition":"Randomization means assigning participants to groups by chance, so neither group is systematically different at the start. In this experiment it is the foundation that makes any comparison between groups meaningful. Without it, we cannot tell whether differences in outcomes are caused by the intervention or by pre-existing differences between groups."},{"term":"Statistical power","definition":"Statistical power is the experiment's ability to detect a real effect if one truly exists. Here it depends on sample size, expected effect size, and variation in the data. If power is too low, a genuinely effective program could go undetected simply because the study was too small to see it."}]
`.trim();

function stagesToMarkdown(stages: Stage[]): string {
  return stages
    .map((s) => `## ${STAGE_META[s.id].title}\n\n${s.content || "_(empty)_"}`)
    .join("\n\n");
}

// Strip any section header lines the LLM may echo (e.g. "━━━ SECTION 1 ━━━")
function stripSectionHeaders(text: string): string {
  return text
    .split("\n")
    .filter((line) => !/^[━\-\s]*(section\s*\d|SECTION\s*\d)/i.test(line.trim()))
    .join("\n")
    .trim();
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
    technical: stripSectionHeaders(techPart?.trim() || raw),
    simplified: stripSectionHeaders(simplePart?.trim() || "(No plain-language explanation generated.)"),
    keyTerms: parseKeyTerms(keyTermsPart ?? ""),
  };
}
