import { NextResponse } from "next/server";
import { getExperiment } from "@/lib/storage";
import { getClient, MODEL } from "@/lib/openai";
import { iterationPrompt, normalizeStages } from "@/lib/prompts";
import { Proposal, StageId } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/experiments/[id]/propose
// Body: { triggerKind: "feedback"|"meeting_notes"|"manual_edit", triggerText: string }
// Returns: { proposal: Proposal }
//
// Does NOT persist anything. The user reviews the proposal, then PATCHes the
// versions endpoint to accept it.
export async function POST(req: Request, ctx: { params: { id: string } }) {
  const exp = await getExperiment(ctx.params.id);
  if (!exp) return NextResponse.json({ error: "not found" }, { status: 404 });

  const body = (await req.json()) as {
    triggerKind?: "feedback" | "meeting_notes" | "manual_edit";
    triggerText?: string;
  };
  const triggerKind = body.triggerKind || "feedback";
  const triggerText = (body.triggerText || "").trim();
  if (!triggerText) {
    return NextResponse.json({ error: "triggerText is required" }, { status: 400 });
  }

  const current = exp.versions[exp.versions.length - 1];
  const { system, user } = iterationPrompt({
    title: exp.title,
    description: exp.description,
    currentStages: current.stages,
    triggerKind,
    triggerText,
  });

  let parsed: {
    summary?: string;
    stages?: unknown;
    rationale?: Record<string, string>;
  } = {};
  try {
    const client = getClient();
    const completion = await client.chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });
    const text = completion.choices[0]?.message?.content || "{}";
    parsed = JSON.parse(text);
  } catch (e) {
    return NextResponse.json(
      { error: `LLM call failed: ${(e as Error).message}` },
      { status: 500 },
    );
  }

  const proposal: Proposal = {
    baseVersion: current.number,
    triggerKind,
    triggerText,
    summary: parsed.summary || "Proposed update.",
    stages: normalizeStages(parsed),
    rationale: (parsed.rationale || {}) as Partial<Record<StageId, string>>,
  };
  return NextResponse.json({ proposal });
}
