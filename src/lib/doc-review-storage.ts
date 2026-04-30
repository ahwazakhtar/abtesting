import fs from "node:fs/promises";
import path from "node:path";
import { DocReview, DocReviewMeta } from "./types";

const DATA_DIR = path.join(process.cwd(), "data", "doc-reviews");
const INDEX_FILE = path.join(DATA_DIR, "index.json");

async function ensureDirs() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(INDEX_FILE);
  } catch {
    await fs.writeFile(INDEX_FILE, JSON.stringify({ reviews: [] }, null, 2));
  }
}

async function readJson<T>(file: string): Promise<T> {
  return JSON.parse(await fs.readFile(file, "utf8")) as T;
}

async function writeJson(file: string, data: unknown) {
  await fs.writeFile(file, JSON.stringify(data, null, 2));
}

function reviewFile(id: string) {
  return path.join(DATA_DIR, `${id}.json`);
}

export async function listDocReviews(): Promise<DocReviewMeta[]> {
  await ensureDirs();
  const idx = await readJson<{ reviews: DocReviewMeta[] }>(INDEX_FILE);
  return [...idx.reviews].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

async function writeIndex(metas: DocReviewMeta[]) {
  await writeJson(INDEX_FILE, { reviews: metas });
}

export async function getDocReview(id: string): Promise<DocReview | null> {
  await ensureDirs();
  try {
    return await readJson<DocReview>(reviewFile(id));
  } catch {
    return null;
  }
}

function toMeta(r: DocReview): DocReviewMeta {
  return { id: r.id, docUrl: r.docUrl, docTitle: r.docTitle, createdAt: r.createdAt, updatedAt: r.updatedAt };
}

export async function createDocReview(r: DocReview): Promise<DocReviewMeta> {
  await ensureDirs();
  await writeJson(reviewFile(r.id), r);
  const idx = await listDocReviews();
  const meta = toMeta(r);
  await writeIndex([meta, ...idx.filter((m) => m.id !== r.id)]);
  return meta;
}

export async function updateDocReview(id: string, patch: Partial<Pick<DocReview, "review" | "docContent" | "docTitle">>): Promise<DocReview> {
  const r = await getDocReview(id);
  if (!r) throw new Error(`DocReview ${id} not found`);
  const now = new Date().toISOString();
  const updated: DocReview = { ...r, ...patch, updatedAt: now };
  await writeJson(reviewFile(id), updated);
  const idx = await listDocReviews();
  await writeIndex([toMeta(updated), ...idx.filter((m) => m.id !== id)]);
  return updated;
}

export async function deleteDocReview(id: string) {
  try { await fs.unlink(reviewFile(id)); } catch { /* already gone */ }
  const idx = await listDocReviews();
  await writeIndex(idx.filter((m) => m.id !== id));
}
