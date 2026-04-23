import { Stage, STAGE_META, STAGE_ORDER, StageId } from "./types";

// The framework is loosely based on "A Practical Approach to Developing AB
// Testing Systems for Digital-First Organizations" — pre-registered hypothesis,
// explicit MDE/power, sampling design that's robust to ground-reality changes,
// pre-specified analysis plan, post-mortem.
const FRAMEWORK = `
You help researchers run rigorous AB tests in real-world settings (often
education, health, or social-sector programs where ground realities — attrition,
political constraints, stakeholder pressure — frequently force the design to
adapt after the original power calculation was done).

You structure every experiment as ${STAGE_ORDER.length} stages:
${STAGE_ORDER.map((id) => `- ${STAGE_META[id].title}: ${STAGE_META[id].blurb}`).join("\n")}

Principles:
- Be specific. Numbers, units, dates. No fluff.
- When the user reports a ground-reality change (e.g. fewer schools available,
  partner now wants a third arm), trace it through ALL downstream stages —
  power, measurement, and analysis usually all need updates.
- When power assumptions change, recompute MDE and call it out.
- Preserve what the user wrote when their words are good; don't paraphrase for
  the sake of paraphrasing.
- Use markdown. Tables are great for arms / sample-size breakdowns.
`.trim();

function stagesAsMarkdown(stages: Stage[]): string {
  return stages
    .map((s) => `## ${STAGE_META[s.id].title}\n\n${s.content || "_(empty)_"}`)
    .join("\n\n");
}

export function initialDraftPrompt(opts: {
  title: string;
  description: string;
}): { system: string; user: string } {
  const system = `${FRAMEWORK}

Your task: produce an INITIAL DRAFT of all stages for a new experiment.

Return STRICT JSON matching this TypeScript type:
{
  "summary": string,                       // one-paragraph summary of the draft
  "stages": [{ "id": StageId, "content": string }],  // one entry per stage, in order
  "rationale": { [stageId]: string }       // one short sentence per stage explaining its content
}

Stage IDs MUST be exactly: ${STAGE_ORDER.join(", ")}.
Use markdown inside content. Do NOT include the stage title as a header inside
content (the UI renders titles separately). For stages where there's not yet
enough information (e.g. results, post-mortem before the experiment runs),
write a brief placeholder noting what will be filled in later.
`;
  const user = `Experiment title: ${opts.title}

Brief description from the user:
${opts.description}

Generate the initial draft.`;
  return { system, user };
}

export function iterationPrompt(opts: {
  title: string;
  description: string;
  currentStages: Stage[];
  triggerKind: "feedback" | "meeting_notes" | "manual_edit";
  triggerText: string;
}): { system: string; user: string } {
  const system = `${FRAMEWORK}

Your task: take the CURRENT plan plus a NEW INPUT from the user (their feedback
or meeting notes) and produce a revised plan.

Critical rules:
- Update ONLY the stages that genuinely need to change. For unchanged stages,
  return the existing content verbatim.
- When sampling, arms, or sample sizes change, you MUST also update the power
  stage (recompute or note that recomputation is required) and the measurement
  + analysis stages if they reference specifics that have shifted.
- In the "rationale" object, ONLY include entries for stages you changed. Each
  rationale should be one or two sentences naming what changed and why.
- The "summary" should read like a changelog entry: 2–4 sentences describing
  what changed across the plan and the reason.

Return STRICT JSON:
{
  "summary": string,
  "stages": [{ "id": StageId, "content": string }],  // ALL stages, in order, even unchanged ones
  "rationale": { [stageId]: string }   // only for changed stages
}

Stage IDs MUST be exactly: ${STAGE_ORDER.join(", ")}.`;
  const triggerLabel =
    opts.triggerKind === "meeting_notes"
      ? "Meeting notes"
      : opts.triggerKind === "feedback"
        ? "User feedback"
        : "Manual edit request";
  const user = `Experiment title: ${opts.title}
Description: ${opts.description}

CURRENT PLAN:
${stagesAsMarkdown(opts.currentStages)}

NEW INPUT (${triggerLabel}):
${opts.triggerText}

Produce the revised plan.`;
  return { system, user };
}

export function emptyStages(): Stage[] {
  return STAGE_ORDER.map((id) => ({ id, content: "" }));
}

// Validate + normalize whatever the LLM returned.
export function normalizeStages(input: unknown): Stage[] {
  const out: Stage[] = emptyStages();
  if (!input || typeof input !== "object") return out;
  const arr = (input as { stages?: unknown }).stages;
  if (!Array.isArray(arr)) return out;
  for (const item of arr) {
    if (!item || typeof item !== "object") continue;
    const id = (item as { id?: unknown }).id as StageId;
    const content = (item as { content?: unknown }).content;
    if (STAGE_ORDER.includes(id) && typeof content === "string") {
      const slot = out.find((s) => s.id === id);
      if (slot) slot.content = content;
    }
  }
  return out;
}
