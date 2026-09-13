import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** "14 September 2026" */
export function formatDate(value: string | Date, locale = "en-GB"): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** "14 Sep 2026, 09:41" */
export function formatDateTime(value: string | Date, locale = "en-GB"): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** "09:41" */
export function formatTime(value: string | Date, locale = "en-GB"): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
}

/** Safe, readable slug for filenames. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Build a path with a safe `next` query param for post-auth redirects. */
export function withNext(path: string, next?: string | null): string {
  if (!next || !isSafeInternalPath(next)) return path;
  const url = new URL(path, "http://local");
  url.searchParams.set("next", next);
  return `${url.pathname}${url.search}`;
}

/** Only allow same-origin relative paths as redirect targets. */
export function isSafeInternalPath(path: string | null | undefined): path is string {
  if (!path) return false;
  if (!path.startsWith("/")) return false;
  if (path.startsWith("//")) return false;
  if (path.includes("\\")) return false;
  if (/^\/[a-z]+:/i.test(path)) return false;
  return true;
}
