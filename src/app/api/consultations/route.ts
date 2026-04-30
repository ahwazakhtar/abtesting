import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { getClient, MODEL } from "@/lib/openai";
import { buildMessages } from "@/lib/advisor-prompts";
import { createConsultation, listConsultations } from "@/lib/consultation-storage";
import { Consultation, ConsultationMessage } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const consultations = await listConsultations();
  return NextResponse.json({ consultations });
}

export async function POST(req: Request) {
  const body = (await req.json()) as { question?: string };
  const question = (body.question || "").trim();
  if (!question) {
    return NextResponse.json({ error: "question is required" }, { status: 400 });
  }

  const userMsg: ConsultationMessage = { id: nanoid(), role: "user", content: question };

  let reply = "";
  try {
    const client = getClient();
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: buildMessages([userMsg]),
    });
    reply = completion.choices[0]?.message?.content?.trim() ?? "";
  } catch (e) {
    return NextResponse.json({ error: `LLM call failed: ${(e as Error).message}` }, { status: 500 });
  }

  const assistantMsg: ConsultationMessage = { id: nanoid(), role: "assistant", content: reply };
  const now = new Date().toISOString();
  const consultation: Consultation = {
    id: nanoid(10),
    title: question.slice(0, 80) + (question.length > 80 ? "…" : ""),
    createdAt: now,
    updatedAt: now,
    messages: [userMsg, assistantMsg],
  };

  const meta = await createConsultation(consultation);
  return NextResponse.json({ consultation: { ...meta, messages: consultation.messages } });
}
