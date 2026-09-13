import { slugify } from "@/lib/utils";

/**
 * Plain-text export of a person's journal. Pure functions only, so the
 * layout can be unit tested without a database.
 */

export interface ExportEntry {
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface ExportOptions {
  siteName: string;
  exportedAt: Date;
  /** BCP 47 locale for dates. Defaults to en-GB. */
  locale?: string;
  /** IANA time zone. Defaults to the runtime's zone. */
  timeZone?: string;
}

export const EXPORT_SEPARATOR = "=".repeat(60);

/** Edits closer than this to the creation time are not called "edited". */
export const EDITED_THRESHOLD_MS = 60_000;

/** True when updated_at is at least a minute after created_at. */
export function wasEdited(createdAt: string, updatedAt: string): boolean {
  const created = Date.parse(createdAt);
  const updated = Date.parse(updatedAt);
  if (Number.isNaN(created) || Number.isNaN(updated)) return false;
  return Math.abs(updated - created) >= EDITED_THRESHOLD_MS;
}

/** Windows and old Mac line endings become LF so the file reads the same everywhere. */
export function normaliseNewlines(text: string): string {
  return text.replace(/\r\n?/g, "\n");
}

function formatStamp(value: string | Date, locale: string, timeZone?: string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
    timeZoneName: "short",
  }).format(date);
}

function titleLine(title: string): string {
  const cleaned = normaliseNewlines(title).replace(/\n+/g, " ").trim();
  return cleaned || "(untitled)";
}

/**
 * Builds the export text: a short header, then every entry newest first,
 * each with its title, timestamps and full body.
 */
export function formatJournalExport(entries: ExportEntry[], opts: ExportOptions): string {
  const locale = opts.locale ?? "en-GB";
  const stamp = (value: string | Date) => formatStamp(value, locale, opts.timeZone);

  const sorted = [...entries].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));

  const header =
    [
      `${opts.siteName} journal export`,
      `Exported: ${stamp(opts.exportedAt)}`,
      `Entries: ${sorted.length}`,
    ].join("\n") + "\n";

  const blocks = sorted.map((entry) => {
    const lines = [EXPORT_SEPARATOR, titleLine(entry.title), `Created: ${stamp(entry.created_at)}`];
    if (wasEdited(entry.created_at, entry.updated_at)) {
      lines.push(`Updated: ${stamp(entry.updated_at)}`);
    }
    lines.push("");
    const body = normaliseNewlines(entry.body);
    return `${lines.join("\n")}\n${body}${body.endsWith("\n") ? "" : "\n"}`;
  });

  // Blocks already end with a newline; joining with one more leaves a blank
  // line between them and exactly one newline at the end of the file.
  return [header, ...blocks].join("\n");
}

/** "<site>-journal-YYYY-MM-DD.txt" using the UTC calendar date. */
export function exportFilename(siteName: string, date: Date): string {
  const slug = slugify(siteName) || "journal";
  const day = date.toISOString().slice(0, 10);
  return `${slug}-journal-${day}.txt`;
}
