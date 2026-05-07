import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { addComment, getComments } from "@/lib/storage";
import { Comment } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const comments = await getComments(ctx.params.id);
  return NextResponse.json({ comments });
}

// POST — add a new comment
// Body: { authorName, content }
// @mentions in content are parsed and stored; an email-alert log is emitted for each.
export async function POST(req: Request, ctx: { params: { id: string } }) {
  const body = (await req.json()) as { authorName?: string; content?: string };
  const authorName = (body.authorName || "").trim();
  const content = (body.content || "").trim();

  if (!authorName || !content) {
    return NextResponse.json({ error: "authorName and content are required" }, { status: 400 });
  }

  const mentions = extractMentions(content);

  // Log email alerts for mentions (replace with real email service as needed).
  for (const mention of mentions) {
    console.log(
      `[email-alert] @${mention} was mentioned by ${authorName} in experiment ${ctx.params.id}`,
    );
  }

  const comment: Comment = {
    id: nanoid(8),
    authorName,
    content,
    mentions,
    createdAt: new Date().toISOString(),
  };

  const comments = await addComment(ctx.params.id, comment);
  return NextResponse.json({ comments, emailsSent: mentions });
}

function extractMentions(text: string): string[] {
  const matches = text.match(/@([\w.-]+)/g) ?? [];
  return [...new Set(matches.map((m) => m.slice(1)))];
}
