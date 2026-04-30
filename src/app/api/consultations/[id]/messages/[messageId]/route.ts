import { NextResponse } from "next/server";
import { editMessage } from "@/lib/consultation-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// PATCH /api/consultations/[id]/messages/[messageId]
// Body: { content: string }
// Manual edit of any message.
export async function PATCH(
  req: Request,
  ctx: { params: { id: string; messageId: string } },
) {
  const body = (await req.json()) as { content?: string };
  const content = (body.content || "").trim();
  if (!content) return NextResponse.json({ error: "content is required" }, { status: 400 });

  try {
    const updated = await editMessage(ctx.params.id, ctx.params.messageId, content);
    return NextResponse.json({ consultation: updated });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 404 });
  }
}
