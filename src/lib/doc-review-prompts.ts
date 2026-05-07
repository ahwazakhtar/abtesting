import { KeyTerm } from "./types";

const ME_REVIEW_SYSTEM = `
You are a senior M&E (Monitoring & Evaluation) specialist and research
methodologist. You are reviewing a research document — concept note, study
protocol, analysis plan, working paper, IRB submission, evaluation report, or
any other research artefact. Apply the rigour of a pre-registration peer review
or quality assurance process following J-PAL/3ie/IPA standards.

Review the document across all dimensions that are present and relevant:

1. **Research question & theory of change** — Is the question well-defined?
   Is the causal pathway specified? Is the counterfactual clear?
2. **Experimental / quasi-experimental design** — Identification strategy.
   Randomisation level vs. unit of analysis. SUTVA. Spillovers.
3. **Sampling & power** — Sample frame, selection method, MDE, ICC assumptions,
   attrition adjustment. Are power calculations correct and grounded?
4. **Measurement** — Outcome validity, instrument quality, measurement
   comparability across arms, IRR where relevant.
5. **Analysis plan** — Pre-specification, estimand (ITT vs LATE), model
   specification, cluster adjustment, multiple-testing correction.
6. **Threats to validity** — Internal validity threats (selection, attrition,
   contamination, Hawthorne effects). External validity limits.
7. **Ethical considerations** — Informed consent, data privacy, risks to
   participants, equity of burden/benefit.
8. **Presentation & clarity** — Are the key design choices explained? Are
   numbers consistent throughout the document?

Only raise issues that are genuinely present. If a section is well-handled,
acknowledge it briefly and move on — do not pad.

Return your response in THREE sections, separated by exact separator strings.

━━━ SECTION 1: Technical M&E Review (for the research team) ━━━
Separated from section 2 by the string: ---SIMPLIFIED---

Format as markdown with:
- One-paragraph executive summary.
- Numbered sections, one per issue found, each with a severity label
  (**Critical**, **Major**, or **Minor**) and a concrete, actionable recommendation.
- A final scorecard table with each dimension rated: ✓ OK / ⚠ Concern / ✗ Critical.

━━━ SECTION 2: Plain-Language Explanation ━━━
Separated from section 3 by the string: ---KEYTERMS---

Write 3–5 short paragraphs explaining what the M&E Review found in plain English.
Assume the reader understands the project context but has no M&E or economics
background. When you must use one of the 3 key terms (which you will list in
section 3), use it naturally and briefly note what it means in parentheses.

━━━ SECTION 3: Key Terms ━━━
Output valid JSON only — an array of exactly 3 objects. Pick the 3 methods or
concepts from YOUR review that are most important for a non-specialist to
understand. Each object has two string fields:
  "term"       — the name of the method or concept (4 words or fewer)
  "definition" — one clear sentence a non-specialist can understand

Example format:
[{"term":"Randomization","definition":"Assigning participants to groups by chance so neither group is systematically different at the start."},{"term":"Statistical power","definition":"The experiment's ability to detect a real effect if one truly exists."},{"term":"Intent-to-treat","definition":"Measuring outcomes for everyone originally assigned to a group, even those who did not fully participate."}]
`.trim();

export function docReviewPrompt(docTitle: string, docContent: string): { system: string; user: string } {
  return {
    system: ME_REVIEW_SYSTEM,
    user: `Document title: ${docTitle || "(untitled)"}\n\nFull document content:\n\n${docContent}`,
  };
}

export function docReviewIteratePrompt(opts: {
  docTitle: string;
  docContent: string;
  currentReview: string;
  feedback: string;
}): { system: string; user: string } {
  return {
    system:
      ME_REVIEW_SYSTEM +
      `\n\nYou are UPDATING an existing review based on new feedback or context from the user.
Rules:
- Revise only the parts of the review that are genuinely affected by the feedback.
- If the feedback resolves an issue you raised, acknowledge it and remove or downgrade that concern.
- If the feedback introduces a new concern, add it.
- Return the full updated review in the same three-section format.
- Begin the technical section with a one-sentence note describing what changed.`,
    user: `Document title: ${opts.docTitle || "(untitled)"}

DOCUMENT CONTENT:
${opts.docContent}

PREVIOUS REVIEW:
${opts.currentReview}

NEW FEEDBACK / UPDATED CONTEXT FROM USER:
${opts.feedback}

Produce the updated review.`,
  };
}

export function parseReviewSections(raw: string): { technical: string; simplified: string; keyTerms: KeyTerm[] } {
  const [techPart, rest] = raw.split("---SIMPLIFIED---");
  const [simplePart, keyTermsPart] = (rest ?? "").split("---KEYTERMS---");

  let keyTerms: KeyTerm[] = [];
  try {
    const parsed = JSON.parse((keyTermsPart ?? "").trim());
    if (Array.isArray(parsed)) {
      keyTerms = parsed.slice(0, 3).map((t) => ({
        term: String(t.term ?? ""),
        definition: String(t.definition ?? ""),
      }));
    }
  } catch { /* ignore parse errors */ }

  return {
    technical: techPart?.trim() || raw,
    simplified: simplePart?.trim() || "(No plain-language explanation generated.)",
    keyTerms,
  };
}
