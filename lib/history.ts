'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Undo/redo for a state value. Rapid changes (slider drags) are grouped:
 * a history entry is committed once the value has been still for `delay` ms.
 */
export function useHistory<T>(value: T, setValue: (v: T) => void, delay = 400, limit = 80) {
  const past = useRef<T[]>([]);
  const future = useRef<T[]>([]);
  const committed = useRef<T>(value);
  const skip = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [, force] = useState(0);
  const bump = () => force((n) => n + 1);

  const flush = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  useEffect(() => {
    if (skip.current) {
      skip.current = false;
      committed.current = value;
      return;
    }
    if (value === committed.current) return;
    const prev = committed.current;
    flush();
    timer.current = setTimeout(() => {
      timer.current = null;
      past.current.push(prev);
      if (past.current.length > limit) past.current.shift();
      future.current = [];
      committed.current = value;
      bump();
    }, delay);
    // Pending edit must be undoable immediately too.
    pendingPrev.current = prev;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const pendingPrev = useRef<T | null>(null);
  const latest = useRef(value);
  latest.current = value;

  const undo = useCallback(() => {
    if (timer.current) {
      // commit the in-flight change first, then undo it
      flush();
      past.current.push(pendingPrev.current as T);
      future.current = [];
      committed.current = latest.current;
    }
    const prev = past.current.pop();
    if (prev === undefined) return;
    future.current.push(latest.current);
    skip.current = true;
    setValue(prev);
    bump();
  }, [flush, setValue]);

  const redo = useCallback(() => {
    flush();
    const next = future.current.pop();
    if (next === undefined) return;
    past.current.push(latest.current);
    skip.current = true;
    setValue(next);
    bump();
  }, [flush, setValue]);

  /** Replace state without creating an undo step (e.g. loading a project). */
  const reset = useCallback(
    (v: T) => {
      flush();
      past.current = [];
      future.current = [];
      skip.current = true;
      setValue(v);
      bump();
    },
    [flush, setValue],
  );

  return {
    undo,
    redo,
    reset,
    canUndo: past.current.length > 0 || timer.current !== null,
    canRedo: future.current.length > 0,
  };
}
