import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { JournalEntryRow } from "@/lib/supabase/types";
import type { EntryListEntry } from "./schemas";

/**
 * Read access for journal entries. Every query filters by user_id as well
 * as relying on row-level security, so a bug elsewhere cannot widen access.
 * Errors are thrown with the database error code only; never with content.
 */

export class JournalQueryError extends Error {
  constructor(
    public readonly code: string,
    message = "Journal query failed",
  ) {
    super(message);
    this.name = "JournalQueryError";
  }
}

/** Titles and dates only, newest first. Bodies are never loaded for the list. */
export async function listEntries(userId: string): Promise<EntryListEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("journal_entries")
    .select("id, title, created_at, updated_at, revision")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new JournalQueryError(error.code ?? "unknown");
  return data ?? [];
}

/** One full entry, or null when it does not exist or belongs to someone else. */
export async function getEntry(userId: string, id: string): Promise<JournalEntryRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", userId)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new JournalQueryError(error.code ?? "unknown");
  return data;
}

/** Every entry with its body, newest first. Used only by the export. */
export async function listEntriesForExport(userId: string): Promise<JournalEntryRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new JournalQueryError(error.code ?? "unknown");
  return data ?? [];
}
