import { NextRequest, NextResponse } from "next/server";
import { listExperiments, getExperiment } from "@/lib/storage";
import { getClient, MODEL } from "@/lib/openai";
import { getCurrentUser, matchesScope } from "@/lib/auth";
import { StageId } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Section = "questions" | "indicators" | "results";

const STAGES_BY_SECTION: Record<Section, StageId[]> = {
  questions: ["hypothesis", "research_questions"],
  indicators: ["measurement"],
  results: ["results", "postmortem"],
};

const SYSTEM_PROMPTS: Record<Section, string> = {
  questions: `You are a senior M&E specialist helping an education-research organization see across its A/B experiments.
Summarize the cross-experiment view of research questions and hypotheses.
Identify recurring themes, the most ambitious bets, gaps where questions feel underspecified, and any tensions between experiments.
Format:
- A short "Themes" section (4–6 markdown bullets).
- A short "Gaps & opportunities" section (2–4 bullets).
- End with a 2–3 sentence synthesis.
Be concrete; reference experiment titles when useful. Do not invent details that are not in the source text.`,
  indicators: `You are a senior M&E specialist helping an education-research organization see across its A/B experiments.
Summarize the cross-experiment view of indicators and measurement plans.
Identify recurring outcomes, instruments, units of analysis, and any gaps or inconsistencies in measurement.
Format:
- A short "Indicators in use" section (4–6 markdown bullets, grouped by family — e.g. learning outcomes, behavioural, system).
- A short "Measurement risks" section (2–4 bullets).
- End with a 2–3 sentence synthesis.
Be concrete; reference experiment titles when useful. Do not invent details that are not in the source text.`,
  results: `You are a senior M&E specialist helping an education-research organization see across its A/B experiments.
Summarize the results emerging across experiments — wins, null findings, surprises, and patterns.
Be honest about how preliminary each finding is; many experiments may still be in design.
Format:
- A short "What's working" section (bullets, with experiment titles).
- A short "Null or mixed findings" section (bullets).
- A short "Open questions / next steps" section (bullets).
- End with a 2–3 sentence synthesis.
Do not overstate evidence. If results stages are empty, say so plainly.`,
};

function isSection(s: unknown): s is Section {
  return s === "questions" || s === "indicators" || s === "results";
}

export async function POST(req: NextRequest) {
  const user = getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  let body: { section?: string } = {};
  try {
    body = (await req.json()) as { section?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!isSection(body.section)) {
    return NextResponse.json({ error: "Unknown section" }, { status: 400 });
  }

  const section: Section = body.section;
  const stageIds = STAGES_BY_SECTION[section];

  const metas = (await listExperiments()).filter((m) =>
    matchesScope(m.ownerEmail, user, "org"),
  );

  const items: { title: string; owner: string; content: string }[] = [];
  for (const m of metas) {
    const full = await getExperiment(m.id);
    if (!full) continue;
    const current = full.versions[full.versions.length - 1];
    if (!current) continue;
    const content = current.stages
      .filter((s) => stageIds.includes(s.id))
      .map((s) => (s.content ?? "").trim())
      .filter((c) => c.length > 0)
      .join("\n\n");
    if (content) {
      items.push({
        title: m.title,
        owner: m.ownerEmail ?? "unassigned",
        content: content.slice(0, 4000),
      });
    }
  }

  if (items.length === 0) {
    return NextResponse.json({
      summary:
        "_No content yet in this section across the organization's experiments. Iterate on a plan to fill in the relevant stages._",
      count: 0,
    });
  }

  const userPrompt = items
    .map((it) => `### ${it.title}\n*Owner: ${it.owner}*\n\n${it.content}`)
    .join("\n\n---\n\n");

  let summary = "";
  try {
    const client = getClient();
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPTS[section] },
        { role: "user", content: userPrompt },
      ],
    });
    summary = completion.choices[0]?.message?.content?.trim() ?? "";
  } catch (e) {
    return NextResponse.json(
      { error: `LLM call failed: ${(e as Error).message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({
    summary,
    count: items.length,
    generatedAt: new Date().toISOString(),
  });
}
