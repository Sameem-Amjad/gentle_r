import type { Draft } from "@/lib/journal/autosave-machine";

/**
 * On-device safety copy of writing that could not be saved. Lives only in
 * this browser's localStorage and is removed as soon as a save succeeds.
 * Nothing here is ever sent anywhere.
 */

export interface StoredDraft extends Draft {
  /** ISO time the copy was written. */
  at: string;
}

const PREFIX = "gentler:draft:";

export function draftKey(entryId: string | null): string {
  return `${PREFIX}${entryId ?? "new"}`;
}

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

/** Subscribe to same-tab writes and cross-tab storage events. */
export function subscribeLocalDrafts(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key.startsWith(PREFIX)) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Raw stored string (stable for useSyncExternalStore), or null. */
export function readLocalDraftRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function parseStoredDraft(raw: string | null): StoredDraft | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<StoredDraft>;
    if (typeof parsed.title !== "string" || typeof parsed.body !== "string") return null;
    return { title: parsed.title, body: parsed.body, at: typeof parsed.at === "string" ? parsed.at : "" };
  } catch {
    return null;
  }
}

export function readLocalDraft(key: string): StoredDraft | null {
  return parseStoredDraft(readLocalDraftRaw(key));
}

export function writeLocalDraft(key: string, draft: Draft): void {
  try {
    const stored: StoredDraft = { title: draft.title, body: draft.body, at: new Date().toISOString() };
    window.localStorage.setItem(key, JSON.stringify(stored));
    notify();
  } catch {
    // Storage may be full or unavailable. The editor still shows the text.
  }
}

export function clearLocalDraft(key: string): void {
  try {
    if (window.localStorage.getItem(key) === null) return;
    window.localStorage.removeItem(key);
    notify();
  } catch {
    // Nothing to do.
  }
}
