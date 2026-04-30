import { NextResponse } from "next/server";
import { getVersion } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/experiments/[id]/versions/[n]/review
// Returns { review: string } once the PhD review is ready, or { review: null } while pending.
export async function GET(
  _req: Request,
  ctx: { params: { id: string; n: string } },
) {
  const n = parseInt(ctx.params.n, 10);
  if (isNaN(n)) return NextResponse.json({ error: "invalid version" }, { status: 400 });

  const version = await getVersion(ctx.params.id, n);
  if (!version) return NextResponse.json({ error: "not found" }, { status: 404 });

  return NextResponse.json({ review: version.phdReview ?? null });
}
