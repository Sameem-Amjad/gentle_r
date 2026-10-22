import type { User } from "@supabase/supabase-js";

/**
 * Shared demo accounts (created by scripts/seed-hub.mjs) carry
 * app_metadata.demo = true. Only the service role can set app_metadata, so a
 * visitor can't remove the flag. Real accounts never have it.
 */
export function isDemoAccount(user: Pick<User, "app_metadata"> | null): boolean {
  return user?.app_metadata?.demo === true;
}
