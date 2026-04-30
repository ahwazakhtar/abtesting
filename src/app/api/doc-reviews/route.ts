import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { getClient } from "@/lib/openai";
import { docReviewPrompt } from "@/lib/doc-review-prompts";
import { createDocReview, listDocReviews } from "@/lib/doc-review-storage";
import { DocReview } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Model for doc reviews — use a stronger model than the default.
const REVIEW_MODEL = process.env.OPENAI_REVIEW_MODEL || "gpt-4o";

export async function GET() {
  const reviews = await listDocReviews();
  return NextResponse.json({ reviews });
}

export async function POST(req: Request) {
  const body = (await req.json()) as { docUrl?: string };
  const docUrl = (body.docUrl || "").trim();
  if (!docUrl) return NextResponse.json({ error: "docUrl is required" }, { status: 400 });

  // Extract Google Docs ID and fetch plain-text export.
  const docId = extractGoogleDocId(docUrl);
  if (!docId) {
    return NextResponse.json(
      { error: "Could not parse a Google Docs ID from that URL. Make sure it is a docs.google.com/document/d/... link." },
      { status: 400 },
    );
  }

  let docContent = "";
  let docTitle = "(untitled)";
  try {
    const exportUrl = `https://docs.google.com/document/d/${docId}/export?format=txt`;
    const fetchRes = await fetch(exportUrl, { redirect: "follow" });
    if (!fetchRes.ok) {
      return NextResponse.json(
        { error: `Could not fetch the document (HTTP ${fetchRes.status}). Make sure the doc is shared as "Anyone with the link can view".` },
        { status: 400 },
      );
    }
    docContent = await fetchRes.text();
    // Attempt to extract the title from the first non-empty line.
    const firstLine = docContent.split("\n").find((l) => l.trim());
    if (firstLine) docTitle = firstLine.trim().slice(0, 120);
  } catch (e) {
    return NextResponse.json({ error: `Fetch failed: ${(e as Error).message}` }, { status: 500 });
  }

  if (!docContent.trim()) {
    return NextResponse.json({ error: "The document appears to be empty." }, { status: 400 });
  }

  // Truncate to ~80k chars to stay within context limits.
  const truncated = docContent.length > 80000
    ? docContent.slice(0, 80000) + "\n\n[… document truncated at 80,000 characters …]"
    : docContent;

  const { system, user } = docReviewPrompt(docTitle, truncated);

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

  const now = new Date().toISOString();
  const docReview: DocReview = {
    id: nanoid(10),
    docUrl,
    docTitle,
    docContent: truncated,
    review,
    createdAt: now,
    updatedAt: now,
  };

  const meta = await createDocReview(docReview);
  return NextResponse.json({ review: docReview, meta });
}

function extractGoogleDocId(url: string): string | null {
  const m = url.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
  return m ? m[1] : null;
}
