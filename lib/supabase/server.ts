import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { requireSupabaseEnv } from "@/lib/env";
import type { Database } from "./types";

/**
 * Server Supabase client bound to the current request's cookies.
 * Create a new one per request (never share across requests).
 *
 * In Server Components cookies cannot be written; token refreshes are
 * handled by proxy.ts, so the setAll failure there is expected and ignored.
 */
export async function createClient() {
  const { url, key } = requireSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component. proxy.ts refreshes sessions.
        }
      },
    },
  });
}

/**
 * Returns the signed-in user or null. Verifies the session with Supabase
 * (network call) rather than trusting the cookie alone.
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}
