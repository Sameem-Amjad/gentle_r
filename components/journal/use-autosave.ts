"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { siteConfig } from "@/config/site";
import { createEntry, saveEntry } from "@/lib/journal/actions";
import {
  autosaveReducer,
  canAutoRetry,
  canSave,
  createInitialState,
  hasUnsavedWork,
  type AutosaveEvent,
  type AutosaveState,
  type Draft,
} from "@/lib/journal/autosave-machine";
import type { EntryPayload } from "@/lib/journal/schemas";
import { clearLocalDraft, draftKey, writeLocalDraft } from "./local-draft-store";

export interface UseAutosaveOptions {
  mode: "new" | "edit";
  entry?: EntryPayload | null;
}

export interface AutosaveApi {
  state: AutosaveState;
  edit: (patch: Partial<Draft>) => void;
  /** Save right away. Resolves true when nothing is left unsaved. */
  saveNow: () => Promise<boolean>;
  retry: () => void;
  resolveUseTheirs: () => void;
  resolveKeepMine: () => void;
  restoreDraft: (draft: Draft) => void;
  /** Copies title and body to the clipboard. Resolves true on success. */
  copyDraft: () => Promise<boolean>;
  /** Stop all saving, for example after the entry has been deleted. */
  disarm: () => void;
}

/**
 * Connects the pure autosave machine to the server actions: debounced saves
 * after typing, one request in flight at a time, automatic retries, and
 * immediate saves when the page is hidden or the editor is left.
 */
export function useAutosave({ mode, entry }: UseAutosaveOptions): AutosaveApi {
  const router = useRouter();
  const routerRef = React.useRef(router);
  React.useEffect(() => {
    routerRef.current = router;
  }, [router]);
  const [state, setState] = React.useState<AutosaveState>(() =>
    createInitialState(mode === "edit" ? entry : null),
  );

  // Mirror of the state that is updated synchronously by dispatch, so async
  // code always reads the latest values without waiting for a render.
  const stateRef = React.useRef(state);
  const startedNewRef = React.useRef(mode === "new");
  const inFlightRef = React.useRef<Promise<boolean> | null>(null);
  const debounceRef = React.useRef<number | null>(null);
  const mountedRef = React.useRef(false);
  const armedRef = React.useRef(true);
  // Set after any confirmed save. Saves don't revalidate (see lib/journal/actions.ts),
  // so the page the person goes to next is refreshed when the editor unmounts.
  const savedRef = React.useRef(false);

  const dispatch = React.useCallback((event: AutosaveEvent) => {
    const next = autosaveReducer(stateRef.current, event);
    if (next === stateRef.current) return;
    stateRef.current = next;
    if (mountedRef.current) setState(next);
  }, []);

  const clearDebounce = React.useCallback(() => {
    if (debounceRef.current !== null) {
      window.clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  }, []);

  const clearSafetyCopies = React.useCallback((entryId: string | null) => {
    clearLocalDraft(draftKey(entryId));
    if (startedNewRef.current) clearLocalDraft(draftKey(null));
  }, []);

  /** Runs one save if allowed. Never runs two at once. */
  const runSave = React.useCallback((): Promise<boolean> => {
    if (inFlightRef.current) return inFlightRef.current;
    const current = stateRef.current;
    if (!armedRef.current || !canSave(current)) {
      return Promise.resolve(!hasUnsavedWork(current));
    }

    dispatch({ type: "SAVE_START" });
    const { title, body } = current.draft;

    const promise = (async (): Promise<boolean> => {
      try {
        if (current.entryId === null) {
          const result = await createEntry({ title, body });
          if (!result.ok) {
            dispatch({ type: "SAVE_FAILED", error: result.error });
            return false;
          }
          savedRef.current = true;
          dispatch({ type: "SAVE_SUCCESS", entry: result.entry, at: new Date().toISOString() });
          if (!hasUnsavedWork(stateRef.current)) clearSafetyCopies(result.entry.id);
          if (mountedRef.current && armedRef.current) {
            // Adopt the entry's URL without remounting the editor.
            window.history.replaceState(null, "", `/journal/${result.entry.id}`);
          }
          return true;
        }

        const result = await saveEntry({
          id: current.entryId,
          title,
          body,
          expectedRevision: current.revision ?? 1,
        });
        if (result.ok) {
          savedRef.current = true;
          dispatch({ type: "SAVE_SUCCESS", entry: result.entry, at: new Date().toISOString() });
          if (!hasUnsavedWork(stateRef.current)) clearSafetyCopies(result.entry.id);
          return true;
        }
        if (result.conflict) {
          dispatch({ type: "SAVE_CONFLICT", current: result.current });
          return false;
        }
        dispatch({ type: "SAVE_FAILED", error: result.error });
        return false;
      } catch {
        dispatch({ type: "SAVE_FAILED", error: "network" });
        return false;
      } finally {
        inFlightRef.current = null;
      }
    })();

    inFlightRef.current = promise;
    return promise;
  }, [dispatch, clearSafetyCopies]);

  const saveNow = React.useCallback(async (): Promise<boolean> => {
    clearDebounce();
    if (inFlightRef.current) await inFlightRef.current;
    const current = stateRef.current;
    if (!hasUnsavedWork(current)) return true;
    if (current.status === "conflict") return false;
    await runSave();
    return !hasUnsavedWork(stateRef.current);
  }, [clearDebounce, runSave]);

  // Mount bookkeeping and a best-effort save when the editor unmounts
  // (for example after the browser's back button).
  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearDebounce();
      const current = stateRef.current;
      // The journal list may be a cached copy from before these saves (the Back
      // button shows it as it was), so fetch it again once the last save is in.
      const refreshIfSaved = () => {
        if (savedRef.current) routerRef.current.refresh();
      };
      if (armedRef.current && hasUnsavedWork(current) && current.status !== "conflict") {
        writeLocalDraft(draftKey(current.entryId), current.draft);
        void runSave().then((saved) => {
          if (saved && !hasUnsavedWork(stateRef.current)) clearSafetyCopies(stateRef.current.entryId);
          refreshIfSaved();
        });
      } else {
        refreshIfSaved();
      }
    };
  }, [clearDebounce, runSave, clearSafetyCopies]);

  // Debounced save after the last edit.
  React.useEffect(() => {
    if (state.status !== "unsaved" || !canSave(state)) return;
    const id = window.setTimeout(() => {
      debounceRef.current = null;
      void runSave();
    }, siteConfig.journal.autosaveDelayMs);
    debounceRef.current = id;
    return () => {
      window.clearTimeout(id);
      if (debounceRef.current === id) debounceRef.current = null;
    };
  }, [state, runSave]);

  // Automatic retries after a failed save, up to a small limit.
  React.useEffect(() => {
    if (!canAutoRetry(state)) return;
    const id = window.setTimeout(() => void runSave(), siteConfig.journal.retryDelayMs);
    return () => window.clearTimeout(id);
  }, [state, runSave]);

  // Keep an on-device copy while a save is failing.
  React.useEffect(() => {
    if (state.status === "error" && hasUnsavedWork(state)) {
      writeLocalDraft(draftKey(state.entryId), state.draft);
    }
  }, [state]);

  // Save when the tab is hidden or the page is being left.
  React.useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden") void saveNow();
    };
    const onPageHide = () => {
      const current = stateRef.current;
      if (hasUnsavedWork(current)) {
        writeLocalDraft(draftKey(current.entryId), current.draft);
        void saveNow();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [saveNow]);

  const edit = React.useCallback((patch: Partial<Draft>) => dispatch({ type: "EDIT", ...patch }), [dispatch]);

  const retry = React.useCallback(() => {
    dispatch({ type: "RETRY" });
    void saveNow();
  }, [dispatch, saveNow]);

  const resolveUseTheirs = React.useCallback(() => {
    dispatch({ type: "RESOLVE_USE_THEIRS" });
    clearSafetyCopies(stateRef.current.entryId);
  }, [dispatch, clearSafetyCopies]);

  const resolveKeepMine = React.useCallback(() => {
    dispatch({ type: "RESOLVE_KEEP_MINE" });
    void saveNow();
  }, [dispatch, saveNow]);

  const restoreDraft = React.useCallback(
    (draft: Draft) => dispatch({ type: "RESTORE_DRAFT", draft }),
    [dispatch],
  );

  const copyDraft = React.useCallback(async (): Promise<boolean> => {
    const { title, body } = stateRef.current.draft;
    const text = [title.trim(), body].filter((part) => part.length > 0).join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }, []);

  const disarm = React.useCallback(() => {
    armedRef.current = false;
    clearDebounce();
    clearSafetyCopies(stateRef.current.entryId);
  }, [clearDebounce, clearSafetyCopies]);

  return { state, edit, saveNow, retry, resolveUseTheirs, resolveKeepMine, restoreDraft, copyDraft, disarm };
}
