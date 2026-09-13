import { describe, expect, it } from "vitest";
import {
  autosaveReducer as reduce,
  canAutoRetry,
  canSave,
  createInitialState,
  hasUnsavedWork,
  isDirty,
  MAX_AUTO_RETRIES,
  shouldCreate,
  type AutosaveEvent,
  type AutosaveState,
  type SavedEntryLike,
} from "@/lib/journal/autosave-machine";

const savedEntry: SavedEntryLike = {
  id: "11111111-1111-4111-8111-111111111111",
  title: "A title",
  body: "Some words.",
  created_at: "2026-09-14T09:00:00Z",
  updated_at: "2026-09-14T09:00:00Z",
  revision: 1,
};

function run(state: AutosaveState, ...events: AutosaveEvent[]): AutosaveState {
  return events.reduce(reduce, state);
}

describe("initial state", () => {
  it("starts a new entry idle, clean and without an id", () => {
    const state = createInitialState(null);
    expect(state.status).toBe("idle");
    expect(state.entryId).toBeNull();
    expect(state.savedAt).toBeNull();
    expect(isDirty(state)).toBe(false);
    expect(shouldCreate(state)).toBe(false);
    expect(canSave(state)).toBe(false);
  });

  it("starts an existing entry as saved with its revision", () => {
    const state = createInitialState(savedEntry);
    expect(state.status).toBe("saved");
    expect(state.entryId).toBe(savedEntry.id);
    expect(state.revision).toBe(1);
    expect(state.createdAt).toBe(savedEntry.created_at);
    expect(isDirty(state)).toBe(false);
  });
});

describe("dirty tracking", () => {
  it("marks edits as unsaved and returns to rest when the text matches again", () => {
    const initial = createInitialState(savedEntry);
    const edited = reduce(initial, { type: "EDIT", body: "Some words. More." });
    expect(edited.status).toBe("unsaved");
    expect(isDirty(edited)).toBe(true);
    expect(canSave(edited)).toBe(true);

    const reverted = reduce(edited, { type: "EDIT", body: savedEntry.body });
    expect(reverted.status).toBe("saved");
    expect(isDirty(reverted)).toBe(false);
  });

  it("goes back to idle for a new entry that is emptied again", () => {
    const state = run(createInitialState(null), { type: "EDIT", body: "hello" }, { type: "EDIT", body: "" });
    expect(state.status).toBe("idle");
    expect(hasUnsavedWork(state)).toBe(false);
  });

  it("returns the same state object for an edit that changes nothing", () => {
    const state = createInitialState(savedEntry);
    expect(reduce(state, { type: "EDIT", title: savedEntry.title })).toBe(state);
  });

  it("does not create an entry for whitespace only", () => {
    const state = reduce(createInitialState(null), { type: "EDIT", body: "   \n\t " });
    expect(isDirty(state)).toBe(true);
    expect(shouldCreate(state)).toBe(false);
    expect(hasUnsavedWork(state)).toBe(false);
    expect(canSave(state)).toBe(false);
  });

  it("creates once there is real content in the title or body", () => {
    expect(shouldCreate(reduce(createInitialState(null), { type: "EDIT", title: "T" }))).toBe(true);
    expect(shouldCreate(reduce(createInitialState(null), { type: "EDIT", body: "b" }))).toBe(true);
  });
});

describe("saving", () => {
  it("sets savedAt, id, revision and snapshot only on success", () => {
    const start = run(
      createInitialState(null),
      { type: "EDIT", body: "Some words." },
      { type: "SAVE_START" },
    );
    expect(start.status).toBe("saving");
    expect(start.savedAt).toBeNull();
    expect(canSave(start)).toBe(false);

    const failed = reduce(start, { type: "SAVE_FAILED", error: "network" });
    expect(failed.status).toBe("error");
    expect(failed.savedAt).toBeNull();
    expect(failed.attempts).toBe(1);
    expect(failed.draft.body).toBe("Some words.");

    const done = reduce(start, {
      type: "SAVE_SUCCESS",
      entry: { ...savedEntry, title: "", body: "Some words." },
      at: "2026-09-14T09:41:00Z",
    });
    expect(done.status).toBe("saved");
    expect(done.savedAt).toBe("2026-09-14T09:41:00Z");
    expect(done.entryId).toBe(savedEntry.id);
    expect(done.revision).toBe(1);
    expect(done.createdAt).toBe(savedEntry.created_at);
    expect(done.snapshot).toEqual({ title: "", body: "Some words." });
    expect(isDirty(done)).toBe(false);
  });

  it("falls back to the server's updated_at when no client time is given", () => {
    const state = run(
      createInitialState(null),
      { type: "EDIT", body: "x" },
      { type: "SAVE_START" },
      { type: "SAVE_SUCCESS", entry: { ...savedEntry, body: "x", updated_at: "2026-09-14T10:00:00Z" } },
    );
    expect(state.savedAt).toBe("2026-09-14T10:00:00Z");
  });

  it("stays unsaved when the person kept typing during the save", () => {
    const typing = run(
      createInitialState(savedEntry),
      { type: "EDIT", body: "Some words. One" },
      { type: "SAVE_START" },
      { type: "EDIT", body: "Some words. One two" },
    );
    expect(typing.status).toBe("saving");

    const after = reduce(typing, {
      type: "SAVE_SUCCESS",
      entry: { ...savedEntry, body: "Some words. One", revision: 2 },
      at: "2026-09-14T09:42:00Z",
    });
    expect(after.status).toBe("unsaved");
    expect(after.revision).toBe(2);
    expect(after.snapshot.body).toBe("Some words. One");
    expect(after.draft.body).toBe("Some words. One two");
    expect(after.savedAt).toBe("2026-09-14T09:42:00Z");
    expect(canSave(after)).toBe(true);
  });

  it("ignores SAVE_START while already saving", () => {
    const saving = run(createInitialState(savedEntry), { type: "EDIT", body: "y" }, { type: "SAVE_START" });
    expect(reduce(saving, { type: "SAVE_START" })).toBe(saving);
  });
});

describe("errors and retries", () => {
  const failing = run(createInitialState(savedEntry), { type: "EDIT", body: "z" }, { type: "SAVE_START" });

  it("allows automatic retries up to the limit, then waits for a manual one", () => {
    let state = failing;
    for (let attempt = 1; attempt <= MAX_AUTO_RETRIES; attempt += 1) {
      state = reduce(state, { type: "SAVE_FAILED", error: "save-failed" });
      expect(state.attempts).toBe(attempt);
      expect(canAutoRetry(state)).toBe(attempt < MAX_AUTO_RETRIES);
      if (attempt < MAX_AUTO_RETRIES) state = reduce(state, { type: "SAVE_START" });
    }
    expect(state.status).toBe("error");
    expect(canSave(state)).toBe(true);

    const retried = reduce(state, { type: "RETRY" });
    expect(retried.status).toBe("unsaved");
    expect(retried.attempts).toBe(0);
    expect(retried.error).toBeNull();
    expect(retried.draft.body).toBe("z");
  });

  it("keeps the text and moves to unsaved when the person edits after a failure", () => {
    const failed = reduce(failing, { type: "SAVE_FAILED", error: "network" });
    const edited = reduce(failed, { type: "EDIT", body: "z and more" });
    expect(edited.status).toBe("unsaved");
    expect(edited.draft.body).toBe("z and more");
    expect(edited.error).toBeNull();
  });

  it("RETRY does nothing outside the error state", () => {
    const saved = createInitialState(savedEntry);
    expect(reduce(saved, { type: "RETRY" })).toBe(saved);
  });
});

describe("conflicts", () => {
  const theirs = { title: "Theirs", body: "Their text", updated_at: "2026-09-14T09:30:00Z", revision: 4 };
  const conflicted = run(
    createInitialState(savedEntry),
    { type: "EDIT", body: "My text" },
    { type: "SAVE_START" },
    { type: "SAVE_CONFLICT", current: theirs },
  );

  it("stops saving and keeps the draft until resolved", () => {
    expect(conflicted.status).toBe("conflict");
    expect(conflicted.conflict).toEqual(theirs);
    expect(conflicted.draft.body).toBe("My text");
    expect(canSave(conflicted)).toBe(false);
    expect(hasUnsavedWork(conflicted)).toBe(true);

    const typed = reduce(conflicted, { type: "EDIT", body: "My text continues" });
    expect(typed.status).toBe("conflict");
    expect(canSave(typed)).toBe(false);
  });

  it("uses their version when asked", () => {
    const resolved = reduce(conflicted, { type: "RESOLVE_USE_THEIRS" });
    expect(resolved.status).toBe("saved");
    expect(resolved.draft).toEqual({ title: "Theirs", body: "Their text" });
    expect(resolved.snapshot).toEqual({ title: "Theirs", body: "Their text" });
    expect(resolved.revision).toBe(4);
    expect(resolved.conflict).toBeNull();
    expect(resolved.savedAt).toBeNull();
    expect(isDirty(resolved)).toBe(false);
  });

  it("keeps mine by adopting their revision and saving again", () => {
    const resolved = reduce(conflicted, { type: "RESOLVE_KEEP_MINE" });
    expect(resolved.status).toBe("unsaved");
    expect(resolved.draft.body).toBe("My text");
    expect(resolved.revision).toBe(4);
    expect(resolved.conflict).toBeNull();
    expect(canSave(resolved)).toBe(true);

    const saved = run(
      resolved,
      { type: "SAVE_START" },
      {
        type: "SAVE_SUCCESS",
        entry: { ...savedEntry, body: "My text", revision: 5 },
        at: "2026-09-14T09:45:00Z",
      },
    );
    expect(saved.status).toBe("saved");
    expect(saved.revision).toBe(5);
  });

  it("treats identical text as already saved when keeping mine", () => {
    const same = run(
      createInitialState(savedEntry),
      { type: "EDIT", title: "Theirs", body: "Their text" },
      { type: "SAVE_START" },
      { type: "SAVE_CONFLICT", current: theirs },
      { type: "RESOLVE_KEEP_MINE" },
    );
    expect(same.status).toBe("saved");
    expect(same.revision).toBe(4);
    expect(isDirty(same)).toBe(false);
  });

  it("ignores resolutions when there is no conflict", () => {
    const plain = createInitialState(savedEntry);
    expect(reduce(plain, { type: "RESOLVE_USE_THEIRS" })).toBe(plain);
    expect(reduce(plain, { type: "RESOLVE_KEEP_MINE" })).toBe(plain);
  });
});

describe("drafts kept on the device", () => {
  it("restores a draft as unsaved and can discard back to the snapshot", () => {
    const restored = reduce(createInitialState(savedEntry), {
      type: "RESTORE_DRAFT",
      draft: { title: "Recovered", body: "From earlier" },
    });
    expect(restored.status).toBe("unsaved");
    expect(restored.draft).toEqual({ title: "Recovered", body: "From earlier" });
    expect(canSave(restored)).toBe(true);

    const discarded = reduce(restored, { type: "DISCARD_DRAFT" });
    expect(discarded.status).toBe("saved");
    expect(discarded.draft).toEqual({ title: savedEntry.title, body: savedEntry.body });
  });
});
