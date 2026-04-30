import { NextResponse } from "next/server";
import { getDocReview, updateDocReview } from "@/lib/doc-review-storage";
import { getClient } from "@/lib/openai";
import { docReviewPrompt } from "@/lib/doc-review-prompts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REVIEW_MODEL = process.env.OPENAI_REVIEW_MODEL || "gpt-4o";

// POST /api/doc-reviews/[id]/regenerate — re-run the PhD review on the same document.
export async function POST(_req: Request, ctx: { params: { id: string } }) {
  const r = await getDocReview(ctx.params.id);
  if (!r) return NextResponse.json({ error: "not found" }, { status: 404 });

  const { system, user } = docReviewPrompt(r.docTitle, r.docContent);

  let review = "";
  try {
    const client = getClient();
    const completion = await client.chat.completions.create({
      model: REVIEW_MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });
    review = completion.choices[0]?.message?.content?.trim() ?? "";
  } catch (e) {
    return NextResponse.json({ error: `LLM call failed: ${(e as Error).message}` }, { status: 500 });
  }

  const updated = await updateDocReview(ctx.params.id, { review });
  return NextResponse.json({ review: updated });
}
