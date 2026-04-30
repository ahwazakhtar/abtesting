import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { getClient, MODEL } from "@/lib/openai";
import { buildMessages } from "@/lib/advisor-prompts";
import { getConsultation, appendMessage } from "@/lib/consultation-storage";
import { ConsultationMessage } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/consultations/[id]/messages
// Body: { content: string }
// Appends the user message, calls the LLM, appends the assistant reply.
export async function POST(req: Request, ctx: { params: { id: string } }) {
  const c = await getConsultation(ctx.params.id);
  if (!c) return NextResponse.json({ error: "not found" }, { status: 404 });

  const body = (await req.json()) as { content?: string };
  const content = (body.content || "").trim();
  if (!content) return NextResponse.json({ error: "content is required" }, { status: 400 });

  const userMsg: ConsultationMessage = { id: nanoid(), role: "user", content };
  const withUser = await appendMessage(ctx.params.id, userMsg);

  let reply = "";
  try {
    const client = getClient();
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: buildMessages(withUser.messages),
    });
    reply = completion.choices[0]?.message?.content?.trim() ?? "";
  } catch (e) {
    return NextResponse.json({ error: `LLM call failed: ${(e as Error).message}` }, { status: 500 });
  }

  const assistantMsg: ConsultationMessage = { id: nanoid(), role: "assistant", content: reply };
  const updated = await appendMessage(ctx.params.id, assistantMsg);
  return NextResponse.json({ consultation: updated, reply: assistantMsg });
}
