import { describe, expect, it } from "vitest";
import {
  EXPORT_SEPARATOR,
  exportFilename,
  formatJournalExport,
  normaliseNewlines,
  wasEdited,
  type ExportEntry,
} from "@/lib/journal/export";

const exportedAt = new Date("2026-09-14T09:41:00Z");
const opts = { siteName: "GentleR", exportedAt, timeZone: "UTC", locale: "en-GB" };

/** Same formatting the export uses, so tests do not depend on ICU month spellings. */
function stamp(value: string | Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(typeof value === "string" ? new Date(value) : value);
}

function entry(overrides: Partial<ExportEntry>): ExportEntry {
  return {
    title: "",
    body: "",
    created_at: "2026-09-10T08:00:00Z",
    updated_at: "2026-09-10T08:00:00Z",
    ...overrides,
  };
}

describe("formatJournalExport", () => {
  const older = entry({
    title: "Morning",
    body: "First line.\nSecond line.",
    created_at: "2026-09-10T08:00:00Z",
    updated_at: "2026-09-10T08:00:30Z",
  });
  const newer = entry({
    title: "Evening",
    body: "Later thoughts.",
    created_at: "2026-09-12T20:15:00Z",
    updated_at: "2026-09-13T07:00:00Z",
  });

  it("starts with a header naming the site, the export time and the count", () => {
    const text = formatJournalExport([older, newer], opts);
    const lines = text.split("\n");
    expect(lines[0]).toBe("GentleR journal export");
    expect(lines[1]).toBe(`Exported: ${stamp(exportedAt)}`);
    expect(lines[2]).toBe("Entries: 2");
    expect(lines[3]).toBe("");
  });

  it("lists entries newest first regardless of input order", () => {
    const text = formatJournalExport([older, newer], opts);
    expect(text.indexOf("Evening")).toBeLessThan(text.indexOf("Morning"));
    const reversed = formatJournalExport([newer, older], opts);
    expect(reversed).toBe(text);
  });

  it("separates entries with a 60-character rule and shows created times", () => {
    const text = formatJournalExport([older, newer], opts);
    expect(EXPORT_SEPARATOR).toHaveLength(60);
    expect(text.split(EXPORT_SEPARATOR)).toHaveLength(3);
    expect(text).toContain(`Created: ${stamp(older.created_at)}`);
    expect(text).toContain(`Created: ${stamp(newer.created_at)}`);
  });

  it("writes (untitled) for empty or whitespace-only titles", () => {
    const text = formatJournalExport(
      [entry({ title: "   ", body: "x" }), entry({ title: "", body: "y" })],
      opts,
    );
    expect(text.match(/\(untitled\)/g)).toHaveLength(2);
  });

  it("adds an Updated line only when the edit is at least a minute later", () => {
    const text = formatJournalExport([older, newer], opts);
    expect(text).not.toContain(`Updated: ${stamp(older.updated_at)}`);
    expect(text).toContain(`Updated: ${stamp(newer.updated_at)}`);

    const exactlyAMinute = entry({ created_at: "2026-09-10T08:00:00Z", updated_at: "2026-09-10T08:01:00Z" });
    expect(formatJournalExport([exactlyAMinute], opts)).toContain("Updated:");
  });

  it("normalises CRLF and CR line endings in bodies", () => {
    const text = formatJournalExport([entry({ body: "one\r\ntwo\rthree\nfour" })], opts);
    expect(text).not.toContain("\r");
    expect(text).toContain("one\ntwo\nthree\nfour\n");
  });

  it("keeps the body verbatim after a blank line and ends the file with one newline", () => {
    const text = formatJournalExport([older], opts);
    expect(text).toContain(`Created: ${stamp(older.created_at)}\n\nFirst line.\nSecond line.\n`);
    expect(text.endsWith("\n")).toBe(true);
    expect(text.endsWith("\n\n")).toBe(false);
  });

  it("handles an empty journal", () => {
    const text = formatJournalExport([], opts);
    expect(text).toContain("Entries: 0");
    expect(text).not.toContain(EXPORT_SEPARATOR);
    expect(text.endsWith("\n")).toBe(true);
  });
});

describe("wasEdited", () => {
  it("is false under a minute and true from a minute on", () => {
    expect(wasEdited("2026-09-10T08:00:00Z", "2026-09-10T08:00:59Z")).toBe(false);
    expect(wasEdited("2026-09-10T08:00:00Z", "2026-09-10T08:01:00Z")).toBe(true);
    expect(wasEdited("2026-09-10T08:00:00Z", "not a date")).toBe(false);
  });
});

describe("normaliseNewlines", () => {
  it("turns CRLF and lone CR into LF", () => {
    expect(normaliseNewlines("a\r\nb\rc\nd")).toBe("a\nb\nc\nd");
  });
});

describe("exportFilename", () => {
  it("builds a slugged, dated .txt name", () => {
    expect(exportFilename("GentleR", exportedAt)).toBe("gentler-journal-2026-09-14.txt");
    expect(exportFilename("Jonathan's Quiet App", exportedAt)).toBe(
      "jonathan-s-quiet-app-journal-2026-09-14.txt",
    );
  });

  it("falls back when the site name has no usable characters", () => {
    expect(exportFilename("***", exportedAt)).toBe("journal-journal-2026-09-14.txt");
  });
});
