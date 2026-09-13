import { z } from "zod";
import { siteConfig } from "@/config/site";

/**
 * Validation and shared types for the journal. Safe to import from both
 * server and client code (no server-only dependencies).
 */

export const entryIdSchema = z.uuid();

export const entryTitleSchema = z.string().max(siteConfig.journal.maxTitleChars, { error: "too-long" });

export const entryBodySchema = z.string().max(siteConfig.journal.maxBodyChars, { error: "too-long" });

export const revisionSchema = z.number().int().positive();

export const createEntryInputSchema = z.object({
  title: entryTitleSchema,
  body: entryBodySchema,
});

export const saveEntryInputSchema = createEntryInputSchema.extend({
  id: entryIdSchema,
  expectedRevision: revisionSchema,
});

export const deleteEntryInputSchema = z.object({ id: entryIdSchema });

export type CreateEntryInput = z.infer<typeof createEntryInputSchema>;
export type SaveEntryInput = z.infer<typeof saveEntryInputSchema>;
export type DeleteEntryInput = z.infer<typeof deleteEntryInputSchema>;

/** True when the string looks like an entry id. Used before touching the database. */
export function isEntryId(value: string): boolean {
  return entryIdSchema.safeParse(value).success;
}

/** Row data that is useful and safe to send to the browser (no user_id). */
export interface EntryPayload {
  id: string;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
  revision: number;
}

/** List rows never include the body. */
export type EntryListEntry = Omit<EntryPayload, "body">;

/** Stable, content-free error codes. The client turns these into calm copy. */
export type JournalErrorCode =
  "unconfigured" | "signed-out" | "invalid" | "too-long" | "not-found" | "save-failed" | "network";

export type CreateEntryResult = { ok: true; entry: EntryPayload } | { ok: false; error: JournalErrorCode };

export type SaveEntryResult =
  | { ok: true; entry: EntryPayload }
  | { ok: false; conflict: true; current: EntryPayload }
  | { ok: false; conflict?: false; error: JournalErrorCode };

export type DeleteEntryResult = { ok: true } | { ok: false; error: JournalErrorCode };

/** Map a zod failure to a content-free error code. */
export function errorCodeFromIssues(issues: { code: string }[]): JournalErrorCode {
  return issues.some((issue) => issue.code === "too_big") ? "too-long" : "invalid";
}
