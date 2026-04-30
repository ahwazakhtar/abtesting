import fs from "node:fs/promises";
import path from "node:path";
import { Consultation, ConsultationMeta, ConsultationMessage } from "./types";

const DATA_DIR = path.join(process.cwd(), "data", "consultations");
const INDEX_FILE = path.join(DATA_DIR, "index.json");

async function ensureDirs() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(INDEX_FILE);
  } catch {
    await fs.writeFile(INDEX_FILE, JSON.stringify({ consultations: [] }, null, 2));
  }
}

async function readJson<T>(file: string): Promise<T> {
  return JSON.parse(await fs.readFile(file, "utf8")) as T;
}

async function writeJson(file: string, data: unknown) {
  await fs.writeFile(file, JSON.stringify(data, null, 2));
}

function consultationFile(id: string) {
  return path.join(DATA_DIR, `${id}.json`);
}

export async function listConsultations(): Promise<ConsultationMeta[]> {
  await ensureDirs();
  const idx = await readJson<{ consultations: ConsultationMeta[] }>(INDEX_FILE);
  return [...idx.consultations].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

async function writeIndex(metas: ConsultationMeta[]) {
  await writeJson(INDEX_FILE, { consultations: metas });
}

export async function getConsultation(id: string): Promise<Consultation | null> {
  await ensureDirs();
  try {
    return await readJson<Consultation>(consultationFile(id));
  } catch {
    return null;
  }
}

export async function createConsultation(c: Consultation): Promise<ConsultationMeta> {
  await ensureDirs();
  await writeJson(consultationFile(c.id), c);
  const meta: ConsultationMeta = { id: c.id, title: c.title, createdAt: c.createdAt, updatedAt: c.updatedAt };
  const idx = await listConsultations();
  await writeIndex([meta, ...idx.filter((m) => m.id !== c.id)]);
  return meta;
}

export async function appendMessage(id: string, message: ConsultationMessage): Promise<Consultation> {
  const c = await getConsultation(id);
  if (!c) throw new Error(`Consultation ${id} not found`);
  const now = new Date().toISOString();
  const updated: Consultation = { ...c, messages: [...c.messages, message], updatedAt: now };
  await writeJson(consultationFile(id), updated);
  const idx = await listConsultations();
  const meta: ConsultationMeta = { id: updated.id, title: updated.title, createdAt: updated.createdAt, updatedAt: now };
  await writeIndex([meta, ...idx.filter((m) => m.id !== id)]);
  return updated;
}

export async function editMessage(id: string, messageId: string, content: string): Promise<Consultation> {
  const c = await getConsultation(id);
  if (!c) throw new Error(`Consultation ${id} not found`);
  const now = new Date().toISOString();
  const messages = c.messages.map((m) =>
    m.id === messageId ? { ...m, content, editedAt: now } : m,
  );
  const updated: Consultation = { ...c, messages, updatedAt: now };
  await writeJson(consultationFile(id), updated);
  return updated;
}

export async function deleteConsultation(id: string) {
  try { await fs.unlink(consultationFile(id)); } catch { /* already gone */ }
  const idx = await listConsultations();
  await writeIndex(idx.filter((m) => m.id !== id));
}
