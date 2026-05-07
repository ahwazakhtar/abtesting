import { NextResponse } from "next/server";
import { getExperiment, getVersion, patchVersionReview } from "@/lib/storage";
import { runMEReview } from "@/lib/review";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/experiments/[id]/versions/[n]/review
export async function GET(
  _req: Request,
  ctx: { params: { id: string; n: string } },
) {
  const n = parseInt(ctx.params.n, 10);
  if (isNaN(n)) return NextResponse.json({ error: "invalid version" }, { status: 400 });

  const version = await getVersion(ctx.params.id, n);
  if (!version) return NextResponse.json({ error: "not found" }, { status: 404 });

  return NextResponse.json({
    meReview: version.meReview ?? version.phdReview ?? null,
    meReviewSimplified: version.meReviewSimplified ?? null,
    meReviewKeyTerms: version.meReviewKeyTerms ?? null,
  });
}

// POST /api/experiments/[id]/versions/[n]/review — trigger on demand
export async function POST(
  _req: Request,
  ctx: { params: { id: string; n: string } },
) {
  const n = parseInt(ctx.params.n, 10);
  if (isNaN(n)) return NextResponse.json({ error: "invalid version" }, { status: 400 });

  const exp = await getExperiment(ctx.params.id);
  if (!exp) return NextResponse.json({ error: "not found" }, { status: 404 });

  const version = await getVersion(ctx.params.id, n);
  if (!version) return NextResponse.json({ error: "version not found" }, { status: 404 });

  if (version.meReview || version.phdReview) {
    return NextResponse.json({
      meReview: version.meReview ?? version.phdReview,
      meReviewSimplified: version.meReviewSimplified ?? null,
      meReviewKeyTerms: version.meReviewKeyTerms ?? null,
      cached: true,
    });
  }

  runMEReview(
    { title: exp.title, description: exp.description },
    version.stages,
  )
    .then(({ technical, simplified, keyTerms }) =>
      patchVersionReview(ctx.params.id, n, technical, simplified, keyTerms),
    )
    .catch((err) => console.error("[me-review] failed:", err));

  return NextResponse.json({ triggered: true });
}
