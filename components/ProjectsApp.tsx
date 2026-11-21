'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import {
  deleteAllProjects,
  deleteProject,
  duplicateProject,
  exportProjects,
  getProject,
  importProjects,
  listProjects,
  saveProject,
  storageEstimate,
  type Project,
} from '../lib/projects';
import { downloadBlob } from '../lib/image';

export default function ProjectsApp() {
  const [items, setItems] = useState<Project[] | null>(null);
  const [err, setErr] = useState('');
  const [renaming, setRenaming] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [confirm, setConfirm] = useState<string | null>(null);
  const [usage, setUsage] = useState<{ used: number; quota: number } | null>(null);
  const [msg, setMsg] = useState('');
  const [wipe, setWipe] = useState(false);

  const load = useCallback(() => {
    listProjects()
      .then(setItems)
      .catch(() => {
        setItems([]);
        setErr('Projects need browser storage, which seems to be blocked (private browsing can do this).');
      });
  }, []);
  useEffect(load, [load]);
  useEffect(() => {
    storageEstimate().then(setUsage);
  }, [items]);

  const mb = (b: number) => `${(b / 1048576).toFixed(1)} MB`;
  const doExport = async (ids?: string[]) => {
    const blob = await exportProjects(ids);
    downloadBlob(blob, `zipperlock-projects-${new Date().toISOString().slice(0, 10)}.zipperlock.json`);
    setMsg(`Exported ${ids ? ids.length : (items?.length ?? 0)} project(s).`);
  };
  const doImport = async (f?: File) => {
    if (!f) return;
    try {
      const n = await importProjects(f);
      setMsg(`Imported ${n} project${n === 1 ? '' : 's'}.`);
      load();
    } catch (e) {
      setMsg((e as Error).message || 'Import failed.');
    }
  };
  const toolbar = (
    <div className="proj-toolbar">
      <button type="button" className="btn-ghost sm" onClick={() => doExport()} disabled={!items?.length}>
        ⤓ Export all
      </button>
      <label className="btn-ghost sm file-btn">
        ⤒ Import
        <input type="file" accept=".json,application/json" onChange={(e) => doImport(e.target.files?.[0])} />
      </label>
      {!!items?.length &&
        (wipe ? (
          <button
            type="button"
            className="btn-ghost sm danger"
            onClick={async () => {
              await deleteAllProjects();
              setWipe(false);
              setMsg('All projects deleted from this browser.');
              load();
            }}
          >
            Confirm: delete all {items.length}
          </button>
        ) : (
          <button type="button" className="btn-ghost sm" onClick={() => setWipe(true)}>
            Delete all
          </button>
        ))}
      {usage && usage.quota > 0 && (
        <span className="muted small">
          Storage used: {mb(usage.used)} of {mb(usage.quota)}
        </span>
      )}
      {msg && (
        <span className="small" role="status">
          {msg}
        </span>
      )}
    </div>
  );

  const rename = async (id: string) => {
    const p = await getProject(id);
    if (p && name.trim()) await saveProject({ ...p, name: name.trim() });
    setRenaming(null);
    load();
  };

  if (items === null) return <p className="muted">Loading your projects…</p>;

  return (
    <>
      {err && <p className="error">{err}</p>}
      {toolbar}
      <p className="muted small">Projects live in this browser only and don’t sync between devices. Use Export to move them or keep a backup.</p>
      {items.length === 0 ? (
        <div className="empty">
          <h2>No saved projects yet</h2>
          <p className="muted">Design something in the Studio and press “Save project”. It’s kept in this browser, photo included.</p>
          <Link href="/studio/" className="btn-primary">
            Open the Studio
          </Link>
        </div>
      ) : (
        <div className="card-grid four">
          {items.map((p) => (
            <article key={p.id} className="card project-card">
              <Link href={`/studio/?project=${p.id}`} className="project-thumb" aria-label={`Open ${p.name}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.thumb} alt="" />
              </Link>
              {renaming === p.id ? (
                <form
                  className="rename"
                  onSubmit={(e) => {
                    e.preventDefault();
                    rename(p.id);
                  }}
                >
                  <input autoFocus value={name} maxLength={60} onChange={(e) => setName(e.target.value)} aria-label="Project name" />
                  <button type="submit" className="btn-primary sm">
                    OK
                  </button>
                </form>
              ) : (
                <h3>{p.name}</h3>
              )}
              <p className="muted small">Edited {new Date(p.updated).toLocaleString()}</p>
              <div className="card-actions wrap-actions">
                <Link href={`/studio/?project=${p.id}`} className="btn-primary sm">
                  Open
                </Link>
                <button
                  type="button"
                  className="btn-ghost sm"
                  onClick={() => {
                    setRenaming(p.id);
                    setName(p.name);
                  }}
                >
                  Rename
                </button>
                <button type="button" className="btn-ghost sm" onClick={() => duplicateProject(p.id).then(load)}>
                  Duplicate
                </button>
                <button type="button" className="btn-ghost sm" onClick={() => doExport([p.id])}>
                  Export
                </button>
                {confirm === p.id ? (
                  <button
                    type="button"
                    className="btn-ghost sm danger"
                    onClick={() => {
                      setConfirm(null);
                      deleteProject(p.id).then(load);
                    }}
                  >
                    Confirm delete
                  </button>
                ) : (
                  <button type="button" className="btn-ghost sm" onClick={() => setConfirm(p.id)}>
                    Delete
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
