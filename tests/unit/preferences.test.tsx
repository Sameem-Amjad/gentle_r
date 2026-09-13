import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { PreferencesProvider, usePreferences } from "@/components/preferences/preferences-provider";
import { DisplaySettings } from "@/components/preferences/display-settings";
import { PREFERENCES_STORAGE_KEY } from "@/components/preferences/types";

/* ------------------------------------------------------------------ */
/* jsdom gaps                                                          */
/* ------------------------------------------------------------------ */

function installMatchMedia() {
  const stub = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
  Object.defineProperty(window, "matchMedia", { configurable: true, writable: true, value: stub });
}

function installRadixStubs() {
  if (typeof window.ResizeObserver === "undefined") {
    class ResizeObserverStub {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    Object.defineProperty(window, "ResizeObserver", {
      configurable: true,
      writable: true,
      value: ResizeObserverStub,
    });
  }
  const proto = window.HTMLElement.prototype as HTMLElement & Record<string, unknown>;
  if (typeof proto.hasPointerCapture !== "function") proto.hasPointerCapture = () => false;
  if (typeof proto.setPointerCapture !== "function") proto.setPointerCapture = () => {};
  if (typeof proto.releasePointerCapture !== "function") proto.releasePointerCapture = () => {};
  if (typeof proto.scrollIntoView !== "function") proto.scrollIntoView = () => {};
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function Consumer() {
  const { preferences, resolvedTheme } = usePreferences();
  return (
    <output data-testid="prefs">
      {`${preferences.motion}|${preferences.textSize}|${preferences.theme}|${resolvedTheme}`}
    </output>
  );
}

function renderTree() {
  return render(
    <PreferencesProvider defaultMotion="system" defaultTheme="system">
      <Consumer />
      <DisplaySettings />
    </PreferencesProvider>,
  );
}

function readStored(): Record<string, unknown> | null {
  const raw = window.localStorage.getItem(PREFERENCES_STORAGE_KEY);
  return raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
}

function html() {
  return document.documentElement;
}

async function openDisplaySettings() {
  fireEvent.click(screen.getByRole("button", { name: "Display settings" }));
  const dialog = await screen.findByRole("dialog", { name: "Display" });
  return within(dialog);
}

/* ------------------------------------------------------------------ */
/* Tests                                                               */
/* ------------------------------------------------------------------ */

beforeAll(() => {
  installMatchMedia();
  installRadixStubs();
});

beforeEach(() => {
  window.localStorage.clear();
  for (const attr of ["data-motion", "data-theme", "data-text"]) html().removeAttribute(attr);
});

afterEach(() => {
  cleanup();
});

describe("PreferencesProvider", () => {
  it("applies the defaults to <html> on mount", () => {
    renderTree();
    expect(html().dataset.motion).toBe("system");
    expect(html().dataset.text).toBe("default");
    // matchMedia reports no dark preference, so "system" resolves to light.
    expect(html().dataset.theme).toBe("light");
    expect(screen.getByTestId("prefs")).toHaveTextContent("system|default|system|light");
  });

  it("reads saved preferences from localStorage", () => {
    window.localStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify({ motion: "off", textSize: "large", theme: "dark" }),
    );
    renderTree();
    expect(html().dataset.motion).toBe("off");
    expect(html().dataset.text).toBe("large");
    expect(html().dataset.theme).toBe("dark");
    expect(screen.getByTestId("prefs")).toHaveTextContent("off|large|dark|dark");
  });

  it("falls back to defaults for unknown or malformed stored values", () => {
    window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify({ motion: "bogus", textSize: 3 }));
    renderTree();
    expect(html().dataset.motion).toBe("system");
    expect(html().dataset.text).toBe("default");

    cleanup();
    window.localStorage.setItem(PREFERENCES_STORAGE_KEY, "{not json");
    renderTree();
    expect(html().dataset.motion).toBe("system");
  });

  it("follows another tab when storage changes", () => {
    renderTree();
    expect(html().dataset.motion).toBe("system");

    act(() => {
      window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify({ motion: "reduced" }));
      window.dispatchEvent(new StorageEvent("storage", { key: PREFERENCES_STORAGE_KEY }));
    });

    expect(html().dataset.motion).toBe("reduced");
    expect(screen.getByTestId("prefs")).toHaveTextContent("reduced|default|system|light");
  });
});

describe("DisplaySettings", () => {
  it("opens from the header button and shows the three controls", async () => {
    renderTree();
    const dialog = await openDisplaySettings();
    expect(dialog.getByRole("group", { name: "Motion" })).toBeInTheDocument();
    expect(dialog.getByRole("group", { name: "Text size" })).toBeInTheDocument();
    expect(dialog.getByRole("group", { name: "Theme" })).toBeInTheDocument();
    // "Auto" exists in both Motion and Theme, so scope to the Motion group.
    const motion = within(dialog.getByRole("group", { name: "Motion" }));
    expect(motion.getAllByRole("radio")).toHaveLength(4);
    expect(motion.getByRole("radio", { name: "Auto" })).toBeChecked();
  });

  it("choosing Off for motion updates <html> and localStorage", async () => {
    renderTree();
    const dialog = await openDisplaySettings();

    const off = dialog.getByRole("radio", { name: "Off" });
    expect(off).not.toBeChecked();
    fireEvent.click(off);

    expect(off).toBeChecked();
    expect(html().dataset.motion).toBe("off");
    expect(readStored()).toMatchObject({ motion: "off" });
    expect(screen.getByTestId("prefs")).toHaveTextContent("off|default|system|light");
  });

  it("changes text size and theme independently", async () => {
    renderTree();
    const dialog = await openDisplaySettings();

    fireEvent.click(dialog.getByRole("radio", { name: "Larger" }));
    expect(html().dataset.text).toBe("larger");
    expect(readStored()).toMatchObject({ textSize: "larger" });

    fireEvent.click(dialog.getByRole("radio", { name: "Evening" }));
    expect(html().dataset.theme).toBe("dark");
    expect(readStored()).toMatchObject({ textSize: "larger", theme: "dark" });
    expect(screen.getByTestId("prefs")).toHaveTextContent("system|larger|dark|dark");
  });

  it("Reset to defaults restores every preference", async () => {
    window.localStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify({ motion: "off", textSize: "larger", theme: "dark" }),
    );
    renderTree();
    expect(html().dataset.motion).toBe("off");

    const dialog = await openDisplaySettings();
    fireEvent.click(dialog.getByRole("button", { name: "Reset to defaults" }));

    expect(html().dataset.motion).toBe("system");
    expect(html().dataset.text).toBe("default");
    expect(html().dataset.theme).toBe("light");
    expect(readStored()).toEqual({ motion: "system", textSize: "default", theme: "system" });
    expect(dialog.getByRole("radio", { name: "Off" })).not.toBeChecked();
    expect(screen.getByTestId("prefs")).toHaveTextContent("system|default|system|light");
  });

  it("keeps working when localStorage throws", async () => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = () => {
      throw new Error("QuotaExceededError");
    };
    try {
      renderTree();
      const dialog = await openDisplaySettings();
      fireEvent.click(dialog.getByRole("radio", { name: "Off" }));
      expect(html().dataset.motion).toBe("off");
    } finally {
      Storage.prototype.setItem = original;
    }
  });
});
