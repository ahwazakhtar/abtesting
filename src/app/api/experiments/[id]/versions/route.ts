import { NextResponse } from "next/server";
import { appendVersion, getExperiment, patchVersionReview } from "@/lib/storage";
import { runPhDReview } from "@/lib/review";
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

  // Spawn PhD review asynchronously — does not block the response.
  runPhDReview(
    { title: exp.title, description: exp.description },
    next.stages,
  )
    .then((review) => patchVersionReview(ctx.params.id, next.number, review))
    .catch((err) => console.error("[phd-review] failed:", err));

  return NextResponse.json({ experiment: meta, version: next });
}
