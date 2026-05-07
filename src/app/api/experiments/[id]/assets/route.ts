import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { addAsset, deleteAsset, getAssets } from "@/lib/storage";
import { Asset } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const assets = await getAssets(ctx.params.id);
  return NextResponse.json({ assets });
}

// POST — add a new linked asset
export async function POST(req: Request, ctx: { params: { id: string } }) {
  const body = (await req.json()) as { label?: string; url?: string };
  const label = (body.label || "").trim();
  const url = (body.url || "").trim();
  if (!label || !url) {
    return NextResponse.json({ error: "label and url are required" }, { status: 400 });
  }

  const asset: Asset = {
    id: nanoid(8),
    label,
    url,
    addedAt: new Date().toISOString(),
  };

  const assets = await addAsset(ctx.params.id, asset);
  return NextResponse.json({ assets });
}

// DELETE — remove an asset by id
export async function DELETE(req: Request, ctx: { params: { id: string } }) {
  const { searchParams } = new URL(req.url);
  const assetId = searchParams.get("assetId");
  if (!assetId) return NextResponse.json({ error: "assetId is required" }, { status: 400 });

  const assets = await deleteAsset(ctx.params.id, assetId);
  return NextResponse.json({ assets });
}
