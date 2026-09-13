export type MotionPreference = "system" | "full" | "reduced" | "off";
export type TextSizePreference = "default" | "large" | "larger";
export type ThemePreference = "system" | "light" | "dark";

export interface Preferences {
  motion: MotionPreference;
  textSize: TextSizePreference;
  theme: ThemePreference;
}

export const PREFERENCES_STORAGE_KEY = "gentler:prefs";

export const MOTION_OPTIONS: MotionPreference[] = ["system", "full", "reduced", "off"];
export const TEXT_SIZE_OPTIONS: TextSizePreference[] = ["default", "large", "larger"];
export const THEME_OPTIONS: ThemePreference[] = ["system", "light", "dark"];

export function isMotion(v: unknown): v is MotionPreference {
  return typeof v === "string" && (MOTION_OPTIONS as string[]).includes(v);
}
export function isTextSize(v: unknown): v is TextSizePreference {
  return typeof v === "string" && (TEXT_SIZE_OPTIONS as string[]).includes(v);
}
export function isTheme(v: unknown): v is ThemePreference {
  return typeof v === "string" && (THEME_OPTIONS as string[]).includes(v);
}
