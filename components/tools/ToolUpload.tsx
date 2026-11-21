'use client';
import { useState } from 'react';
import { ACCEPT, decodeImage, validateImage } from '../../lib/image';
import type { SourceImage } from '../../lib/design';

export default function ToolUpload({
  onImage,
  label = 'Upload an image',
  hasImage,
}: {
  onImage: (img: SourceImage, file: File) => void;
  label?: string;
  hasImage?: boolean;
}) {
  const [err, setErr] = useState('');
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const take = async (f?: File | null) => {
    setErr('');
    if (!f) return;
    const bad = validateImage(f);
    if (bad) return setErr(bad);
    setBusy(true);
    try {
      onImage(await decodeImage(f), f);
    } catch {
      setErr('This image could not be opened.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <label
        className={`dropzone ${over ? 'over' : ''} ${hasImage ? 'slim' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          take(e.dataTransfer.files?.[0]);
        }}
      >
        <input type="file" accept={ACCEPT.join(',')} onChange={(e) => take(e.target.files?.[0])} />
        <strong>{busy ? 'Opening…' : hasImage ? 'Choose another image' : label}</strong>
        <small>JPG, PNG or WebP · up to 20 MB · processed on your device</small>
      </label>
      {err && (
        <p className="error" role="alert">
          {err}
        </p>
      )}
    </>
  );
}
