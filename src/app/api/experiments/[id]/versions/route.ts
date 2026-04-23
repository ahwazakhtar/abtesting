import { NextResponse } from "next/server";
import { appendVersion, getExperiment } from "@/lib/storage";
import { Proposal, Version } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/experiments/[id]/versions
// Body: { proposal: Proposal }
// Accepts a proposal as the next version.
export async function POST(req: Request, ctx: { params: { id: string } }) {
  const exp = await getExperiment(ctx.params.id);
  if (!exp) return NextResponse.json({ error: "not found" }, { status: 404 });

  const body = (await req.json()) as { proposal?: Proposal };
  const p = body.proposal;
  if (!p || !Array.isArray(p.stages)) {
    return NextResponse.json({ error: "proposal is required" }, { status: 400 });
  }

  const next: Version = {
    number: exp.currentVersion + 1,
    createdAt: new Date().toISOString(),
    triggerKind: p.triggerKind,
    triggerText: p.triggerText,
    summary: p.summary,
    stages: p.stages,
  };
  const meta = await appendVersion(ctx.params.id, next);
  return NextResponse.json({ experiment: meta, version: next });
}
