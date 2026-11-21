/**
 * Local project storage (IndexedDB). Projects never leave the device.
 */
import { normalizeDesign, type Design } from './design';

export interface Project {
  id: string;
  name: string;
  design: Design;
  image?: Blob | null;
  imageName?: string;
  deviceId?: string;
  thumb: string;
  created: number;
  updated: number;
}

const DB = 'zipperlock';
const STORE = 'projects';

function open(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    if (typeof indexedDB === 'undefined') return rej(new Error('IndexedDB unavailable'));
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => {
      const db = r.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' }).createIndex('updated', 'updated');
    };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  return new Promise((res, rej) => {
    const t = db.transaction(STORE, mode);
    const req = fn(t.objectStore(STORE));
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
    t.oncomplete = () => db.close();
  });
}

export const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export async function listProjects(): Promise<Project[]> {
  const all = (await tx<Project[]>('readonly', (s) => s.getAll())).filter((p) => !p.id.startsWith('__'));
  return all.map((p) => ({ ...p, design: normalizeDesign(p.design) })).sort((a, b) => b.updated - a.updated);
}

export async function getProject(id: string): Promise<Project | undefined> {
  const p = await tx<Project | undefined>('readonly', (s) => s.get(id));
  return p ? { ...p, design: normalizeDesign(p.design) } : undefined;
}

export async function saveProject(p: Project) {
  await tx('readwrite', (s) => s.put({ ...p, updated: Date.now() }));
}

export async function deleteProject(id: string) {
  await tx('readwrite', (s) => s.delete(id));
}

export async function duplicateProject(id: string) {
  const p = await getProject(id);
  if (!p) return;
  const now = Date.now();
  await saveProject({ ...p, id: newId(), name: `${p.name} (copy)`, created: now, updated: now });
}

/** Lightweight working draft (design only, no image) for crash/refresh recovery. */
const DRAFT = 'zl:draft';
export function saveDraft(d: Design) {
  try {
    localStorage.setItem(DRAFT, JSON.stringify(d));
  } catch {}
}
export function loadDraft(): Design | null {
  try {
    const s = localStorage.getItem(DRAFT);
    return s ? normalizeDesign(JSON.parse(s)) : null;
  } catch {
    return null;
  }
}

/* ---- hand an image from a tool to the Studio (?handoff=1) ---- */
const HANDOFF = '__handoff';
export async function setHandoff(blob: Blob, name: string) {
  await tx('readwrite', (s) =>
    s.put({ id: HANDOFF, name, image: blob, imageName: name, design: null, thumb: '', created: Date.now(), updated: Date.now() }),
  );
}
export async function takeHandoff(): Promise<{ blob: Blob; name: string } | null> {
  const p = await tx<Project | undefined>('readonly', (s) => s.get(HANDOFF));
  if (!p?.image) return null;
  await tx('readwrite', (s) => s.delete(HANDOFF));
  return { blob: p.image, name: p.imageName ?? 'image.png' };
}

/* ---- export / import (portable .zipperlock.json) ---- */
interface ExportedProject extends Omit<Project, 'image'> {
  image?: string | null; // data URL
}
const blobToDataUrl = (b: Blob) =>
  new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = () => rej(r.error);
    r.readAsDataURL(b);
  });

export async function exportProjects(ids?: string[]): Promise<Blob> {
  const all = await listProjects();
  const list = ids ? all.filter((p) => ids.includes(p.id)) : all;
  const out: ExportedProject[] = [];
  for (const p of list) out.push({ ...p, image: p.image ? await blobToDataUrl(p.image) : null });
  return new Blob([JSON.stringify({ app: 'zipperlock', version: 1, exported: new Date().toISOString(), projects: out })], { type: 'application/json' });
}

/** Imports projects from an export file. Returns how many were added. Validates structure and image types. */
export async function importProjects(file: File): Promise<number> {
  if (file.size > 200 * 1024 * 1024) throw new Error('File is too large.');
  const data = JSON.parse(await file.text());
  if (data?.app !== 'zipperlock' || !Array.isArray(data.projects)) throw new Error('This is not a ZipperLock project file.');
  let n = 0;
  for (const raw of data.projects as ExportedProject[]) {
    if (!raw || typeof raw.name !== 'string' || typeof raw.design !== 'object') continue;
    let image: Blob | null = null;
    if (typeof raw.image === 'string' && /^data:image\/(png|jpeg|webp);base64,/.test(raw.image)) image = await (await fetch(raw.image)).blob();
    const thumb = typeof raw.thumb === 'string' && /^data:image\/(png|jpeg|webp);base64,/.test(raw.thumb) ? raw.thumb : '';
    const now = Date.now();
    await saveProject({
      id: newId(),
      name: raw.name.slice(0, 60),
      design: normalizeDesign(raw.design),
      image,
      imageName: typeof raw.imageName === 'string' ? raw.imageName.slice(0, 120) : undefined,
      deviceId: typeof raw.deviceId === 'string' ? raw.deviceId : undefined,
      thumb,
      created: now,
      updated: now,
    });
    n++;
  }
  return n;
}

export async function deleteAllProjects() {
  const all = await listProjects();
  for (const p of all) await deleteProject(p.id);
}

export async function storageEstimate(): Promise<{ used: number; quota: number } | null> {
  try {
    const e = await navigator.storage?.estimate?.();
    return e ? { used: e.usage ?? 0, quota: e.quota ?? 0 } : null;
  } catch {
    return null;
  }
}
