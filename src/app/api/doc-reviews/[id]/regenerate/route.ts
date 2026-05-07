import { NextResponse } from "next/server";
import { getDocReview, updateDocReview } from "@/lib/doc-review-storage";
import { getClient } from "@/lib/openai";
import { docReviewPrompt, parseReviewSections } from "@/lib/doc-review-prompts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REVIEW_MODEL = process.env.OPENAI_REVIEW_MODEL || "gpt-4o";

export async function POST(_req: Request, ctx: { params: { id: string } }) {
  const r = await getDocReview(ctx.params.id);
  if (!r) return NextResponse.json({ error: "not found" }, { status: 404 });

  const { system, user } = docReviewPrompt(r.docTitle, r.docContent);

  let rawReview = "";
  try {
    const client = getClient();
    const completion = await client.chat.completions.create({
      model: REVIEW_MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });
    rawReview = completion.choices[0]?.message?.content?.trim() ?? "";
  } catch (e) {
    return NextResponse.json({ error: `LLM call failed: ${(e as Error).message}` }, { status: 500 });
  }

  const { technical, simplified } = parseReviewSections(rawReview);
  const updated = await updateDocReview(ctx.params.id, { review: technical, reviewSimplified: simplified });
  return NextResponse.json({ review: updated });
}
