/** Shared image helpers for the studio and tools. */
import { normalizeDesign, type Design, type SourceImage } from './design';

export const ACCEPT = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_BYTES = 20 * 1024 * 1024;
const MAX_SIDE = 4096;

/** Returns an error message, or '' when the file is OK. */
export function validateImage(f: File): string {
  if (!ACCEPT.includes(f.type))
    return `“${f.name}” isn't a supported image. Please use JPG, PNG or WebP. (iPhone HEIC photos: share them as “Most Compatible” or take a screenshot first.)`;
  if (f.size > MAX_BYTES) return `That file is ${(f.size / 1048576).toFixed(1)} MB. The maximum is 20 MB.`;
  return '';
}

export async function decodeImage(file: Blob): Promise<SourceImage> {
  let src: CanvasImageSource;
  let w: number;
  let h: number;
  try {
    const bmp = await createImageBitmap(file);
    src = bmp;
    w = bmp.width;
    h = bmp.height;
  } catch {
    const url = URL.createObjectURL(file);
    const im = new Image();
    im.decoding = 'async';
    im.src = url;
    await im.decode();
    src = im;
    w = im.naturalWidth;
    h = im.naturalHeight;
  }
  if (!w || !h) throw new Error('decode');
  const scale = Math.min(1, MAX_SIDE / Math.max(w, h));
  if (scale < 1) {
    const c = document.createElement('canvas');
    c.width = Math.round(w * scale);
    c.height = Math.round(h * scale);
    const x = c.getContext('2d')!;
    x.imageSmoothingQuality = 'high';
    x.drawImage(src, 0, 0, c.width, c.height);
    return { src: c, w: c.width, h: c.height };
  }
  return { src, w, h };
}

export function canvasToBlob(c: HTMLCanvasElement, type = 'image/png', q = 0.92): Promise<Blob> {
  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('encode'))), type, q));
}

export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

/* ---- share a design in a URL (?d=...) ---- */
export function encodeDesign(d: Design): string {
  const json = JSON.stringify(d);
  const b64 = btoa(unescape(encodeURIComponent(json)));
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
export function decodeDesign(s: string): Design | null {
  try {
    const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(escape(atob(b64)));
    return normalizeDesign(JSON.parse(json));
  } catch {
    return null;
  }
}
