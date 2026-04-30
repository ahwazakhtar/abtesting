import { NextResponse } from "next/server";
import { getDocReview, updateDocReview } from "@/lib/doc-review-storage";
import { getClient } from "@/lib/openai";
import { docReviewIteratePrompt } from "@/lib/doc-review-prompts";
import { DocReviewVersion } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REVIEW_MODEL = process.env.OPENAI_REVIEW_MODEL || "gpt-4o";

// POST /api/doc-reviews/[id]/iterate
// Body: { feedback: string }
// Updates the review based on new feedback, preserving the previous version in history.
export async function POST(req: Request, ctx: { params: { id: string } }) {
  const r = await getDocReview(ctx.params.id);
  if (!r) return NextResponse.json({ error: "not found" }, { status: 404 });

  const body = (await req.json()) as { feedback?: string };
  const feedback = (body.feedback || "").trim();
  if (!feedback) return NextResponse.json({ error: "feedback is required" }, { status: 400 });

  const { system, user } = docReviewIteratePrompt({
    docTitle: r.docTitle,
    docContent: r.docContent,
    currentReview: r.review,
    feedback,
  });

  let newReview = "";
  try {
    const client = getClient();
    const completion = await client.chat.completions.create({
      model: REVIEW_MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });
    newReview = completion.choices[0]?.message?.content?.trim() ?? "";
  } catch (e) {
    return NextResponse.json({ error: `LLM call failed: ${(e as Error).message}` }, { status: 500 });
  }

  const snapshot: DocReviewVersion = {
    review: r.review,
    feedback,
    createdAt: new Date().toISOString(),
  };

  const updated = await updateDocReview(ctx.params.id, {
    review: newReview,
    history: [...(r.history ?? []), snapshot],
  });

  return NextResponse.json({ review: updated });
}
