import { PREFERENCES_STORAGE_KEY, type MotionPreference, type ThemePreference } from "./types";

/**
 * Inline script that applies saved display preferences to <html> before
 * React hydrates, so there is no flash of the wrong theme, text size or
 * motion level. Kept tiny and defensive; any failure falls back to defaults.
 */
export function PreferencesScript({
  defaultMotion,
  defaultTheme,
}: {
  defaultMotion: MotionPreference;
  defaultTheme: ThemePreference;
}) {
  const code = `(function(){try{var d=document.documentElement;var p={};try{p=JSON.parse(localStorage.getItem(${JSON.stringify(
    PREFERENCES_STORAGE_KEY,
  )})||"{}")||{}}catch(e){}var t=p.theme||${JSON.stringify(defaultTheme)};if(t==="system"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}d.setAttribute("data-theme",t);d.setAttribute("data-motion",p.motion||${JSON.stringify(
    defaultMotion,
  )});d.setAttribute("data-text",p.textSize||"default")}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
