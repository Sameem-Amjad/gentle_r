"use client";

import { hasSupabaseEnv } from "@/lib/env";

/**
 * Cosmetic helpers that keep the browser Supabase client (and so the header)
 * in step with cookies the server has just changed. Authorisation never
 * depends on these; the server and row-level security decide everything.
 */
export async function clearBrowserSession(): Promise<void> {
  if (!hasSupabaseEnv()) return;
  try {
    const { createClient } = await import("@/lib/supabase/client");
    await createClient().auth.signOut({ scope: "local" });
  } catch {
    // Nothing to do: the server has already signed the person out.
  }
}
