"use client";

import * as React from "react";
import {
  PREFERENCES_STORAGE_KEY,
  isMotion,
  isTextSize,
  isTheme,
  type Preferences,
  type MotionPreference,
  type ThemePreference,
} from "./types";

interface PreferencesContextValue {
  preferences: Preferences;
  /** Resolved theme after "system" is evaluated. */
  resolvedTheme: "light" | "dark";
  setPreferences: (patch: Partial<Preferences>) => void;
  reset: () => void;
}

const PreferencesContext = React.createContext<PreferencesContextValue | null>(null);

function readStored(defaults: Preferences): Preferences {
  if (typeof window === "undefined") return defaults;
  try {
    const raw = window.localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<Record<keyof Preferences, unknown>>;
    return {
      motion: isMotion(parsed.motion) ? parsed.motion : defaults.motion,
      textSize: isTextSize(parsed.textSize) ? parsed.textSize : defaults.textSize,
      theme: isTheme(parsed.theme) ? parsed.theme : defaults.theme,
    };
  } catch {
    return defaults;
  }
}

function writeStored(prefs: Preferences) {
  try {
    window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Storage may be unavailable (private mode). Preferences still apply for this visit.
  }
}

function systemPrefersDark(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolveTheme(theme: ThemePreference, prefersDark: boolean): "light" | "dark" {
  if (theme !== "system") return theme;
  return prefersDark ? "dark" : "light";
}

function applyToDocument(prefs: Preferences, prefersDark: boolean) {
  const d = document.documentElement;
  d.setAttribute("data-theme", resolveTheme(prefs.theme, prefersDark));
  d.setAttribute("data-motion", prefs.motion);
  d.setAttribute("data-text", prefs.textSize);
}

/** Subscribe helpers for useSyncExternalStore. */
function subscribeToStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}
function subscribeToScheme(callback: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

export function PreferencesProvider({
  children,
  defaultMotion,
  defaultTheme,
}: {
  children: React.ReactNode;
  defaultMotion: MotionPreference;
  defaultTheme: ThemePreference;
}) {
  const defaults = React.useMemo<Preferences>(
    () => ({ motion: defaultMotion, textSize: "default", theme: defaultTheme }),
    [defaultMotion, defaultTheme],
  );

  // Cross-tab changes: re-read storage when another tab writes preferences.
  const storedSnapshot = React.useSyncExternalStore(
    subscribeToStorage,
    () => {
      try {
        return window.localStorage.getItem(PREFERENCES_STORAGE_KEY) ?? "";
      } catch {
        return "";
      }
    },
    () => "",
  );

  const prefersDark = React.useSyncExternalStore(subscribeToScheme, systemPrefersDark, () => false);

  // Local overrides made in this tab, layered on top of the stored snapshot.
  const [override, setOverride] = React.useState<Preferences | null>(null);
  const [lastSnapshot, setLastSnapshot] = React.useState(storedSnapshot);
  if (storedSnapshot !== lastSnapshot) {
    // Another tab changed preferences: drop our override and follow storage.
    setLastSnapshot(storedSnapshot);
    setOverride(null);
  }

  const preferences = React.useMemo<Preferences>(() => override ?? readStored(defaults), [override, defaults, lastSnapshot]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync <html> attributes with the current preferences (external system).
  React.useEffect(() => {
    applyToDocument(preferences, prefersDark);
  }, [preferences, prefersDark]);

  const setPreferences = React.useCallback(
    (patch: Partial<Preferences>) => {
      setOverride((prev) => {
        const next = { ...(prev ?? readStored(defaults)), ...patch };
        writeStored(next);
        return next;
      });
    },
    [defaults],
  );

  const reset = React.useCallback(() => {
    writeStored(defaults);
    setOverride(defaults);
  }, [defaults]);

  const value = React.useMemo(
    () => ({
      preferences,
      resolvedTheme: resolveTheme(preferences.theme, prefersDark),
      setPreferences,
      reset,
    }),
    [preferences, prefersDark, setPreferences, reset],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences(): PreferencesContextValue {
  const ctx = React.useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences must be used inside <PreferencesProvider>");
  return ctx;
}
