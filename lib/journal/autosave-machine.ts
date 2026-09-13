/**
 * Autosave state machine for the journal editor.
 *
 * Pure: no React, no timers, no network. The hook in
 * components/journal/use-autosave.ts feeds it events and reads derived
 * helpers to decide when to call the server. Keeping it pure means the
 * tricky cases (typing during a save, conflicts, retries) are unit tested.
 */

export type SaveStatus = "idle" | "unsaved" | "saving" | "saved" | "error" | "conflict";

export interface Draft {
  title: string;
  body: string;
}

/** What the server returns after a successful create or save. */
export interface SavedEntryLike {
  id: string;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
  revision: number;
}

/** The other version discovered during a conflict. */
export interface ConflictVersion {
  title: string;
  body: string;
  updated_at: string;
  revision: number;
}

export interface AutosaveState {
  /** null until the first successful create. */
  entryId: string | null;
  /** Revision the client last loaded or saved; sent with every save. */
  revision: number | null;
  /** Original creation time, once known. */
  createdAt: string | null;
  /** What the person sees in the editor. */
  draft: Draft;
  /** Last content confirmed by the server. */
  snapshot: Draft;
  status: SaveStatus;
  /** Set only when a save succeeds. */
  savedAt: string | null;
  /** Content-free error code from the last failed save. */
  error: string | null;
  conflict: ConflictVersion | null;
  /** Failed attempts since the last success or manual retry. */
  attempts: number;
}

export type AutosaveEvent =
  | { type: "EDIT"; title?: string; body?: string }
  | { type: "SAVE_START" }
  | { type: "SAVE_SUCCESS"; entry: SavedEntryLike; at?: string }
  | { type: "SAVE_FAILED"; error: string }
  | { type: "SAVE_CONFLICT"; current: ConflictVersion }
  | { type: "RESOLVE_USE_THEIRS" }
  | { type: "RESOLVE_KEEP_MINE" }
  | { type: "RETRY" }
  | { type: "RESTORE_DRAFT"; draft: Draft }
  | { type: "DISCARD_DRAFT" };

/** Automatic retries after a failed save before waiting for a manual one. */
export const MAX_AUTO_RETRIES = 3;

const EMPTY: Draft = { title: "", body: "" };

export function createInitialState(entry?: SavedEntryLike | null): AutosaveState {
  if (entry) {
    const content = { title: entry.title, body: entry.body };
    return {
      entryId: entry.id,
      revision: entry.revision,
      createdAt: entry.created_at,
      draft: content,
      snapshot: { ...content },
      status: "saved",
      savedAt: null,
      error: null,
      conflict: null,
      attempts: 0,
    };
  }
  return {
    entryId: null,
    revision: null,
    createdAt: null,
    draft: { ...EMPTY },
    snapshot: { ...EMPTY },
    status: "idle",
    savedAt: null,
    error: null,
    conflict: null,
    attempts: 0,
  };
}

export function draftsEqual(a: Draft, b: Draft): boolean {
  return a.title === b.title && a.body === b.body;
}

/** True when the draft differs from what the server last confirmed. */
export function isDirty(state: AutosaveState): boolean {
  return !draftsEqual(state.draft, state.snapshot);
}

/** True when there is at least one non-whitespace character. */
export function hasContent(draft: Draft): boolean {
  return draft.title.trim().length > 0 || draft.body.trim().length > 0;
}

/** A new entry is only created once there is something to keep. */
export function shouldCreate(state: AutosaveState): boolean {
  return state.entryId === null && hasContent(state.draft);
}

/**
 * True when leaving now would lose writing: the draft is dirty and either
 * belongs to an existing entry or has enough content to become one.
 */
export function hasUnsavedWork(state: AutosaveState): boolean {
  if (!isDirty(state)) return false;
  return state.entryId !== null || shouldCreate(state);
}

/** True when a save may start right now. */
export function canSave(state: AutosaveState): boolean {
  if (state.status === "saving" || state.status === "conflict") return false;
  return hasUnsavedWork(state);
}

/** True when the hook should schedule another attempt without being asked. */
export function canAutoRetry(state: AutosaveState): boolean {
  return state.status === "error" && state.attempts < MAX_AUTO_RETRIES;
}

/** Status to show when the draft matches the snapshot again. */
function restingStatus(state: AutosaveState): SaveStatus {
  return state.entryId === null ? "idle" : "saved";
}

/** Apply a new draft, choosing the right status for it. */
function withDraft(state: AutosaveState, draft: Draft): AutosaveState {
  if (draftsEqual(draft, state.draft)) return state;

  // While a save is in flight or a conflict is open the status must not
  // change: SAVE_SUCCESS compares content afterwards, and a conflict has
  // to be resolved by the person before anything else happens.
  if (state.status === "saving" || state.status === "conflict") {
    return { ...state, draft };
  }

  const dirty = !draftsEqual(draft, state.snapshot);
  const status: SaveStatus = dirty ? "unsaved" : restingStatus(state);
  return {
    ...state,
    draft,
    status,
    error: status === "error" ? state.error : null,
    attempts: dirty ? state.attempts : 0,
  };
}

export function autosaveReducer(state: AutosaveState, event: AutosaveEvent): AutosaveState {
  switch (event.type) {
    case "EDIT": {
      const draft: Draft = {
        title: event.title ?? state.draft.title,
        body: event.body ?? state.draft.body,
      };
      return withDraft(state, draft);
    }

    case "SAVE_START": {
      if (state.status === "saving" || state.status === "conflict") return state;
      return { ...state, status: "saving", error: null };
    }

    case "SAVE_SUCCESS": {
      const { entry } = event;
      const snapshot: Draft = { title: entry.title, body: entry.body };
      // If the person kept typing during the save, the draft is ahead of
      // what was stored and another save must follow.
      const status: SaveStatus = draftsEqual(state.draft, snapshot) ? "saved" : "unsaved";
      return {
        ...state,
        entryId: entry.id,
        revision: entry.revision,
        createdAt: entry.created_at,
        snapshot,
        status,
        savedAt: event.at ?? entry.updated_at,
        error: null,
        conflict: null,
        attempts: 0,
      };
    }

    case "SAVE_FAILED": {
      return {
        ...state,
        status: "error",
        error: event.error,
        attempts: state.attempts + 1,
      };
    }

    case "SAVE_CONFLICT": {
      return {
        ...state,
        status: "conflict",
        conflict: event.current,
        error: null,
        attempts: 0,
      };
    }

    case "RESOLVE_USE_THEIRS": {
      if (!state.conflict) return state;
      const theirs: Draft = { title: state.conflict.title, body: state.conflict.body };
      return {
        ...state,
        draft: theirs,
        snapshot: { ...theirs },
        revision: state.conflict.revision,
        status: "saved",
        conflict: null,
        error: null,
        attempts: 0,
      };
    }

    case "RESOLVE_KEEP_MINE": {
      if (!state.conflict) return state;
      const theirs: Draft = { title: state.conflict.title, body: state.conflict.body };
      const same = draftsEqual(state.draft, theirs);
      return {
        ...state,
        // Deliberately overwrite: save on top of their revision.
        revision: state.conflict.revision,
        snapshot: same ? { ...theirs } : state.snapshot,
        status: same ? "saved" : "unsaved",
        conflict: null,
        error: null,
        attempts: 0,
      };
    }

    case "RETRY": {
      if (state.status !== "error") return state;
      return { ...state, status: "unsaved", error: null, attempts: 0 };
    }

    case "RESTORE_DRAFT": {
      return withDraft(state, { title: event.draft.title, body: event.draft.body });
    }

    case "DISCARD_DRAFT": {
      return withDraft(state, { ...state.snapshot });
    }

    default:
      return state;
  }
}
