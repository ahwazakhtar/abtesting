import { NextResponse } from "next/server";
import { getExperiment, deleteExperiment } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const exp = await getExperiment(ctx.params.id);
  if (!exp) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ experiment: exp });
}

export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  await deleteExperiment(ctx.params.id);
  return NextResponse.json({ ok: true });
}
