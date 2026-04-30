import { NextResponse } from "next/server";
import { getConsultation, deleteConsultation } from "@/lib/consultation-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const c = await getConsultation(ctx.params.id);
  if (!c) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ consultation: c });
}

export async function DELETE(_req: Request, ctx: { params: { id: string } }) {
  await deleteConsultation(ctx.params.id);
  return NextResponse.json({ ok: true });
}
