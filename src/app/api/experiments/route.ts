import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { listExperiments, createExperiment } from "@/lib/storage";
import { getClient, MODEL } from "@/lib/openai";
import { initialDraftPrompt, normalizeStages } from "@/lib/prompts";
import { Version } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const exps = await listExperiments();
  return NextResponse.json({ experiments: exps });
}

export async function POST(req: Request) {
  const body = (await req.json()) as { title?: string; description?: string };
  const title = (body.title || "").trim();
  const description = (body.description || "").trim();
  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  // Generate the v1 draft via the LLM.
  const { system, user } = initialDraftPrompt({ title, description });
  let parsed: { summary?: string; stages?: unknown; rationale?: Record<string, string> } = {};
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

  const id = slugify(title) + "-" + nanoid(6);
  const v1: Version = {
    number: 1,
    createdAt: new Date().toISOString(),
    triggerKind: "initial",
    triggerText: description || "Initial draft",
    summary: parsed.summary || "Initial draft.",
    stages: normalizeStages(parsed),
  };

  const meta = await createExperiment(
    { id, title, description },
    v1,
  );
  return NextResponse.json({ experiment: meta });
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "experiment";
}
