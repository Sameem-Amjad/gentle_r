"use client";

import { createBrowserClient } from "@supabase/ssr";
import { requireSupabaseEnv } from "@/lib/env";
import type { Database } from "./types";

/**
 * Browser Supabase client. Safe to call repeatedly; @supabase/ssr returns a
 * singleton per page. Use only inside Client Components.
 */
export function createClient() {
  const { url, key } = requireSupabaseEnv();
  return createBrowserClient<Database>(url, key);
}
