import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { siteConfig } from "@/config/site";
import { ToastProvider } from "@/components/ui/toast";
import type { EntryPayload } from "@/lib/journal/schemas";

/**
 * Runtime smoke test for the editor wiring: debounce, create, failure
 * handling, on-device recovery and the conflict safeguard. The server
 * actions and the router are mocked; nothing leaves the test.
 */

const mocks = vi.hoisted(() => ({
  createEntry: vi.fn(),
  saveEntry: vi.fn(),
  deleteEntry: vi.fn(),
  push: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("@/lib/journal/actions", () => ({
  createEntry: mocks.createEntry,
  saveEntry: mocks.saveEntry,
  deleteEntry: mocks.deleteEntry,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mocks.push,
    refresh: mocks.refresh,
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/journal/new",
}));

import { EntryEditor } from "@/components/journal/entry-editor";

const ID = "11111111-1111-4111-8111-111111111111";
const NOW = "2026-09-14T09:00:00.000Z";
const LATER = "2026-09-14T09:30:00.000Z";

const existing: EntryPayload = {
  id: ID,
  title: "A title",
  body: "Server words",
  created_at: NOW,
  updated_at: NOW,
  revision: 2,
};

function renderEditor(props: React.ComponentProps<typeof EntryEditor>) {
  return render(
    <ToastProvider>
      <EntryEditor {...props} />
    </ToastProvider>,
  );
}

async function settle(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

const status = () => screen.getByRole("status", { name: "Save status" });
const bodyField = () => screen.getByLabelText("What's on your mind?");

describe("EntryEditor", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.localStorage.clear();
    mocks.createEntry.mockReset();
    mocks.saveEntry.mockReset();
    mocks.deleteEntry.mockReset();
    mocks.push.mockReset();
    mocks.refresh.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    window.history.replaceState(null, "", "/");
  });

  it("creates the entry after a pause in typing and only then says Saved", async () => {
    mocks.createEntry.mockResolvedValue({
      ok: true,
      entry: { id: ID, title: "", body: "Hello", created_at: NOW, updated_at: NOW, revision: 1 },
    });
    renderEditor({ mode: "new" });

    expect(status()).toHaveTextContent("Not saved yet");
    fireEvent.change(bodyField(), { target: { value: "Hello" } });
    expect(status()).toHaveTextContent("Unsaved changes");
    expect(screen.getByRole("button", { name: "Save now" })).toBeInTheDocument();
    expect(mocks.createEntry).not.toHaveBeenCalled();

    await settle(siteConfig.journal.autosaveDelayMs + 5);

    expect(mocks.createEntry).toHaveBeenCalledTimes(1);
    expect(mocks.createEntry).toHaveBeenCalledWith({ title: "", body: "Hello" });
    expect(status()).toHaveTextContent(/Saved at/);
    expect(window.location.pathname).toBe(`/journal/${ID}`);
    expect(screen.queryByRole("button", { name: "Save now" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Delete entry/ })).toBeInTheDocument();
  });

  it("refreshes the next page after leaving an editor that saved, and not otherwise", async () => {
    mocks.createEntry.mockResolvedValue({
      ok: true,
      entry: { id: ID, title: "", body: "Hello", created_at: NOW, updated_at: NOW, revision: 1 },
    });
    const first = renderEditor({ mode: "new" });
    first.unmount();
    expect(mocks.refresh).not.toHaveBeenCalled();

    const second = renderEditor({ mode: "new" });
    fireEvent.change(bodyField(), { target: { value: "Hello" } });
    await settle(siteConfig.journal.autosaveDelayMs + 5);
    expect(status()).toHaveTextContent(/Saved at/);
    // Saves don't revalidate, so the journal list behind the Back button is refreshed here.
    second.unmount();
    expect(mocks.refresh).toHaveBeenCalledTimes(1);
  });

  it("does not create an entry for whitespace only", async () => {
    renderEditor({ mode: "new" });
    fireEvent.change(bodyField(), { target: { value: "   \n" } });
    await settle(siteConfig.journal.autosaveDelayMs * 2);
    expect(mocks.createEntry).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: "Save now" })).not.toBeInTheDocument();
  });

  it("keeps the text, offers Retry and keeps a copy on this device when saving fails", async () => {
    mocks.createEntry.mockResolvedValue({ ok: false, error: "save-failed" });
    renderEditor({ mode: "new" });

    fireEvent.change(bodyField(), { target: { value: "Keep me" } });
    await settle(siteConfig.journal.autosaveDelayMs + 5);

    expect(status()).toHaveTextContent("Couldn't save. Your text is still here.");
    expect(bodyField()).toHaveValue("Keep me");
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy text" })).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem("gentler:draft:new") ?? "{}")).toMatchObject({
      title: "",
      body: "Keep me",
    });

    // The next automatic attempt succeeds and the safety copy goes away.
    mocks.createEntry.mockResolvedValue({
      ok: true,
      entry: { id: ID, title: "", body: "Keep me", created_at: NOW, updated_at: NOW, revision: 1 },
    });
    await settle(siteConfig.journal.retryDelayMs + 5);

    expect(mocks.createEntry).toHaveBeenCalledTimes(2);
    expect(status()).toHaveTextContent(/Saved at/);
    expect(window.localStorage.getItem("gentler:draft:new")).toBeNull();
    expect(window.localStorage.getItem(`gentler:draft:${ID}`)).toBeNull();
  });

  it("offers back writing kept on this device and restores it as unsaved", async () => {
    window.localStorage.setItem(
      `gentler:draft:${ID}`,
      JSON.stringify({ title: "A title", body: "Recovered words", at: LATER }),
    );
    renderEditor({ mode: "edit", entry: existing });

    expect(screen.getByText(/We kept writing from earlier on this device/)).toBeInTheDocument();
    expect(bodyField()).toHaveValue("Server words");

    fireEvent.click(screen.getByRole("button", { name: "Restore it" }));

    expect(bodyField()).toHaveValue("Recovered words");
    expect(status()).toHaveTextContent("Unsaved changes");
    expect(screen.queryByText(/We kept writing from earlier/)).not.toBeInTheDocument();
  });

  it("discards a kept copy when asked and removes it from this device", () => {
    window.localStorage.setItem(`gentler:draft:${ID}`, JSON.stringify({ title: "", body: "Old", at: LATER }));
    renderEditor({ mode: "edit", entry: existing });
    fireEvent.click(screen.getByRole("button", { name: "Discard" }));
    expect(window.localStorage.getItem(`gentler:draft:${ID}`)).toBeNull();
    expect(bodyField()).toHaveValue("Server words");
  });

  it("asks which version to keep on a conflict instead of overwriting", async () => {
    mocks.saveEntry.mockResolvedValue({
      ok: false,
      conflict: true,
      current: {
        id: ID,
        title: "Theirs",
        body: "Their words",
        created_at: NOW,
        updated_at: LATER,
        revision: 3,
      },
    });
    renderEditor({ mode: "edit", entry: existing });

    fireEvent.change(bodyField(), { target: { value: "My words" } });
    await settle(siteConfig.journal.autosaveDelayMs + 5);

    expect(mocks.saveEntry).toHaveBeenCalledWith({
      id: ID,
      title: "A title",
      body: "My words",
      expectedRevision: 2,
    });
    expect(screen.getByRole("alert")).toHaveTextContent("This entry was changed somewhere else");
    expect(bodyField()).toHaveValue("My words");

    // Time passes: nothing is saved on its own while the choice is open.
    await settle(siteConfig.journal.autosaveDelayMs * 3);
    expect(mocks.saveEntry).toHaveBeenCalledTimes(1);

    mocks.saveEntry.mockResolvedValue({
      ok: true,
      entry: { ...existing, body: "My words", updated_at: LATER, revision: 4 },
    });
    fireEvent.click(screen.getByRole("button", { name: "Keep mine" }));
    await settle(10);

    expect(mocks.saveEntry).toHaveBeenLastCalledWith({
      id: ID,
      title: "A title",
      body: "My words",
      expectedRevision: 3,
    });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(status()).toHaveTextContent(/Saved at/);
  });

  it("takes their version when asked and stops treating the draft as unsaved", async () => {
    mocks.saveEntry.mockResolvedValue({
      ok: false,
      conflict: true,
      current: {
        id: ID,
        title: "Theirs",
        body: "Their words",
        created_at: NOW,
        updated_at: LATER,
        revision: 3,
      },
    });
    renderEditor({ mode: "edit", entry: existing });

    fireEvent.change(bodyField(), { target: { value: "My words" } });
    await settle(siteConfig.journal.autosaveDelayMs + 5);
    fireEvent.click(screen.getByRole("button", { name: "Use that version" }));

    expect(bodyField()).toHaveValue("Their words");
    expect(screen.getByLabelText("Title")).toHaveValue("Theirs");
    expect(status()).toHaveTextContent("Saved");
    await settle(siteConfig.journal.autosaveDelayMs * 2);
    expect(mocks.saveEntry).toHaveBeenCalledTimes(1);
  });
});
