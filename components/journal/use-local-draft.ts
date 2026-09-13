"use client";

import * as React from "react";
import type { AutosaveState, Draft } from "@/lib/journal/autosave-machine";
import { hasContent } from "@/lib/journal/autosave-machine";
import {
  clearLocalDraft,
  draftKey,
  parseStoredDraft,
  readLocalDraftRaw,
  subscribeLocalDrafts,
  type StoredDraft,
} from "./local-draft-store";

export interface LocalDraftApi {
  /** Writing kept on this device that never reached the server, if any. */
  recovered: StoredDraft | null;
  restoreRecovered: () => void;
  discardRecovered: () => void;
}

/**
 * Finds an on-device copy left behind by an earlier failed save and offers
 * it back. The copy is written by useAutosave and removed once a save
 * succeeds; this hook only reads it and lets the person decide.
 */
export function useLocalDraft(state: AutosaveState, restore: (draft: Draft) => void): LocalDraftApi {
  // What the server had when the editor opened. Captured once.
  const [opening] = React.useState(() => ({ entryId: state.entryId, snapshot: { ...state.snapshot } }));
  const key = draftKey(opening.entryId);

  const raw = React.useSyncExternalStore(
    subscribeLocalDrafts,
    () => readLocalDraftRaw(key),
    () => null,
  );

  const [handled, setHandled] = React.useState(false);

  const stored = React.useMemo(() => parseStoredDraft(raw), [raw]);

  const candidate = React.useMemo(() => {
    if (!stored || !hasContent(stored)) return null;
    const differs = stored.title !== opening.snapshot.title || stored.body !== opening.snapshot.body;
    return differs ? stored : null;
  }, [stored, opening]);

  // A copy that matches the server is stale; tidy it away quietly.
  React.useEffect(() => {
    if (stored && !candidate) clearLocalDraft(key);
  }, [stored, candidate, key]);

  const recovered = handled ? null : candidate;

  const restoreRecovered = React.useCallback(() => {
    if (!candidate) return;
    setHandled(true);
    restore({ title: candidate.title, body: candidate.body });
  }, [candidate, restore]);

  const discardRecovered = React.useCallback(() => {
    setHandled(true);
    clearLocalDraft(key);
  }, [key]);

  return { recovered, restoreRecovered, discardRecovered };
}
