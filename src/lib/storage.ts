// JSON-file storage. Each experiment lives in data/experiments/<id>/, with a
// meta.json and versions/<n>.json files. An index.json at the top of /data
// lists all experiments for fast dashboard reads.

import fs from "node:fs/promises";
import path from "node:path";
import { Asset, Comment, Experiment, ExperimentMeta, KeyTerm, Version } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const EXPERIMENTS_DIR = path.join(DATA_DIR, "experiments");
const INDEX_FILE = path.join(DATA_DIR, "index.json");

async function ensureDirs() {
  await fs.mkdir(EXPERIMENTS_DIR, { recursive: true });
  try {
    await fs.access(INDEX_FILE);
  } catch {
    await fs.writeFile(INDEX_FILE, JSON.stringify({ experiments: [] }, null, 2));
  }
}

async function readJson<T>(file: string): Promise<T> {
  const raw = await fs.readFile(file, "utf8");
  return JSON.parse(raw) as T;
}

async function writeJson(file: string, data: unknown) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(data, null, 2));
}

export async function listExperiments(): Promise<ExperimentMeta[]> {
  await ensureDirs();
  const idx = await readJson<{ experiments: ExperimentMeta[] }>(INDEX_FILE);
  // Sort newest first.
  return [...idx.experiments].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
}

async function writeIndex(metas: ExperimentMeta[]) {
  await writeJson(INDEX_FILE, { experiments: metas });
}

function expDir(id: string) {
  return path.join(EXPERIMENTS_DIR, id);
}

function metaFile(id: string) {
  return path.join(expDir(id), "meta.json");
}

function versionFile(id: string, n: number) {
  return path.join(expDir(id), "versions", `${n}.json`);
}

function assetsFile(id: string) {
  return path.join(expDir(id), "assets.json");
}

function commentsFile(id: string) {
  return path.join(expDir(id), "comments.json");
}

export async function getExperiment(id: string): Promise<Experiment | null> {
  await ensureDirs();
  try {
    const meta = await readJson<ExperimentMeta>(metaFile(id));
    const versions: Version[] = [];
    for (let n = 1; n <= meta.currentVersion; n++) {
      try {
        const v = await readJson<Version>(versionFile(id, n));
        versions.push(v);
      } catch {
        // skip missing version files gracefully
      }
    }
    // Load assets and comments if present
    let assets: Asset[] = [];
    let comments: Comment[] = [];
    try { assets = await readJson<Asset[]>(assetsFile(id)); } catch { /* none yet */ }
    try { comments = await readJson<Comment[]>(commentsFile(id)); } catch { /* none yet */ }
    return { ...meta, versions, assets, comments };
  } catch {
    return null;
  }
}

export async function getVersion(id: string, n: number): Promise<Version | null> {
  try {
    return await readJson<Version>(versionFile(id, n));
  } catch {
    return null;
  }
}

export async function createExperiment(
  meta: Omit<ExperimentMeta, "createdAt" | "updatedAt" | "currentVersion">,
  initialVersion: Version,
): Promise<ExperimentMeta> {
  await ensureDirs();
  const now = new Date().toISOString();
  const fullMeta: ExperimentMeta = {
    ...meta,
    createdAt: now,
    updatedAt: now,
    currentVersion: initialVersion.number,
  };
  await writeJson(metaFile(meta.id), fullMeta);
  await writeJson(versionFile(meta.id, initialVersion.number), initialVersion);
  const idx = await listExperiments();
  await writeIndex([fullMeta, ...idx.filter((e) => e.id !== meta.id)]);
  return fullMeta;
}

export async function appendVersion(id: string, version: Version): Promise<ExperimentMeta> {
  const exp = await getExperiment(id);
  if (!exp) throw new Error(`Experiment ${id} not found`);
  await writeJson(versionFile(id, version.number), version);
  const newMeta: ExperimentMeta = {
    id: exp.id,
    title: exp.title,
    description: exp.description,
    createdAt: exp.createdAt,
    updatedAt: new Date().toISOString(),
    currentVersion: version.number,
    ownerEmail: exp.ownerEmail,
  };
  await writeJson(metaFile(id), newMeta);
  const idx = await listExperiments();
  await writeIndex([newMeta, ...idx.filter((e) => e.id !== id)]);
  return newMeta;
}

export async function patchVersionReview(
  id: string,
  versionNumber: number,
  meReview: string,
  meReviewSimplified: string,
  meReviewKeyTerms: KeyTerm[],
) {
  const v = await readJson<Version>(versionFile(id, versionNumber));
  await writeJson(versionFile(id, versionNumber), { ...v, meReview, meReviewSimplified, meReviewKeyTerms });
}

export async function deleteExperiment(id: string) {
  await fs.rm(expDir(id), { recursive: true, force: true });
  const idx = await listExperiments();
  await writeIndex(idx.filter((e) => e.id !== id));
}

// ─── Assets ──────────────────────────────────────────────────────────────────

export async function getAssets(id: string): Promise<Asset[]> {
  try {
    return await readJson<Asset[]>(assetsFile(id));
  } catch {
    return [];
  }
}

export async function addAsset(id: string, asset: Asset): Promise<Asset[]> {
  const assets = await getAssets(id);
  const updated = [...assets, asset];
  await writeJson(assetsFile(id), updated);
  return updated;
}

export async function deleteAsset(id: string, assetId: string): Promise<Asset[]> {
  const assets = await getAssets(id);
  const updated = assets.filter((a) => a.id !== assetId);
  await writeJson(assetsFile(id), updated);
  return updated;
}

// ─── Comments ─────────────────────────────────────────────────────────────────

export async function getComments(id: string): Promise<Comment[]> {
  try {
    return await readJson<Comment[]>(commentsFile(id));
  } catch {
    return [];
  }
}

export async function addComment(id: string, comment: Comment): Promise<Comment[]> {
  const comments = await getComments(id);
  const updated = [...comments, comment];
  await writeJson(commentsFile(id), updated);
  return updated;
}
