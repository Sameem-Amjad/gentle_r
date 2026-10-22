"use server";

import { revalidatePath } from "next/cache";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import type { JournalEntryRow } from "@/lib/supabase/types";
import {
  createEntryInputSchema,
  deleteEntryInputSchema,
  errorCodeFromIssues,
  saveEntryInputSchema,
  type CreateEntryResult,
  type DeleteEntryResult,
  type EntryPayload,
  type SaveEntryResult,
} from "./schemas";

/**
 * Server actions for the journal. Each one verifies the signed-in user,
 * validates its input and returns a result object. Expected failures never
 * throw. Nothing here logs titles, bodies or email addresses.
 */

function toPayload(row: JournalEntryRow): EntryPayload {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    created_at: row.created_at,
    updated_at: row.updated_at,
    revision: row.revision,
  };
}

export async function createEntry(input: unknown): Promise<CreateEntryResult> {
  if (!hasSupabaseEnv()) return { ok: false, error: "unconfigured" };

  const parsed = createEntryInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: errorCodeFromIssues(parsed.error.issues) };

  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "signed-out" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("journal_entries")
    .insert({ user_id: user.id, title: parsed.data.title, body: parsed.data.body })
    .select()
    .single();

  if (error || !data) {
    console.error("journal.createEntry failed", error?.code ?? "no-row");
    return { ok: false, error: "save-failed" };
  }

  // No revalidatePath here or in saveEntry: in a Server Function it re-renders
  // the page being viewed, and once the editor has adopted /journal/<id> that
  // is the [id] page, which remounts the editor with the row as it was a moment
  // ago and drops whatever was typed since. The list is force-dynamic, so it is
  // fresh on every visit anyway.
  return { ok: true, entry: toPayload(data) };
}

export async function saveEntry(input: unknown): Promise<SaveEntryResult> {
  if (!hasSupabaseEnv()) return { ok: false, error: "unconfigured" };

  const parsed = saveEntryInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: errorCodeFromIssues(parsed.error.issues) };

  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "signed-out" };

  const { id, title, body, expectedRevision } = parsed.data;
  const supabase = await createClient();

  // The update only applies when the row is still at the revision this
  // client last saw. The database trigger bumps revision and updated_at.
  const { data, error } = await supabase
    .from("journal_entries")
    .update({ title, body })
    .eq("id", id)
    .eq("user_id", user.id)
    .eq("revision", expectedRevision)
    .select()
    .maybeSingle();

  if (error) {
    console.error("journal.saveEntry failed", error.code);
    return { ok: false, error: "save-failed" };
  }

  if (data) return { ok: true, entry: toPayload(data) };

  // Nothing matched: either the entry is gone or another tab or device
  // saved a newer revision. Fetch the current row to tell the two apart.
  const current = await supabase
    .from("journal_entries")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (current.error) {
    console.error("journal.saveEntry lookup failed", current.error.code);
    return { ok: false, error: "save-failed" };
  }
  if (!current.data) return { ok: false, error: "not-found" };

  return { ok: false, conflict: true, current: toPayload(current.data) };
}

export async function deleteEntry(input: unknown): Promise<DeleteEntryResult> {
  if (!hasSupabaseEnv()) return { ok: false, error: "unconfigured" };

  const parsed = deleteEntryInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };

  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "signed-out" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("journal_entries")
    .delete()
    .eq("id", parsed.data.id)
    .eq("user_id", user.id)
    .select("id");

  if (error) {
    console.error("journal.deleteEntry failed", error.code);
    return { ok: false, error: "save-failed" };
  }
  if (!data || data.length === 0) return { ok: false, error: "not-found" };

  revalidatePath("/journal");
  return { ok: true };
}
