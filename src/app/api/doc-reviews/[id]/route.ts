import { NextResponse } from "next/server";
import { getDocReview, updateDocReview, deleteDocReview } from "@/lib/doc-review-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const r = await getDocReview(ctx.params.id);
  if (!r) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ review: r });
}

// PATCH — manual edit to the review text.
export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  const body = (await req.json()) as { review?: string };
  const review = body.review;
  if (typeof review !== "string") {
    return NextResponse.json({ error: "review (string) is required" }, { status: 400 });
  }
  try {
    const updated = await updateDocReview(ctx.params.id, { review });
    return NextResponse.json({ review: updated });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 404 });
  }
}

export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  await deleteDocReview(ctx.params.id);
  return NextResponse.json({ ok: true });
}
