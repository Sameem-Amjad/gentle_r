import { isSafeInternalPath } from "@/lib/utils";

/** Where a signed-in person lands when nothing more specific was asked for. */
export const DEFAULT_AFTER_SIGN_IN = "/journal";

/** Auth screens should never be a post-sign-in destination. */
const AUTH_SCREEN_PATTERN =
  /^\/(?:sign-in|sign-up|forgot-password|check-email|link-problem|account-deleted)(?:[/?#]|$)|^\/auth\//;

/**
 * Picks a safe same-origin destination from an untrusted `next` value.
 * Falls back when the value is missing, external, or one of the auth screens.
 */
export function resolveNextPath(
  candidate: string | string[] | null | undefined,
  fallback = DEFAULT_AFTER_SIGN_IN,
): string {
  const value = Array.isArray(candidate) ? candidate[0] : candidate;
  if (!isSafeInternalPath(value)) return fallback;
  if (AUTH_SCREEN_PATTERN.test(value)) return fallback;
  return value;
}

/** Returns the `next` value only when it is safe to echo back into a form or link. */
export function safeNextOrUndefined(candidate: string | string[] | null | undefined): string | undefined {
  const value = Array.isArray(candidate) ? candidate[0] : candidate;
  if (!isSafeInternalPath(value)) return undefined;
  if (AUTH_SCREEN_PATTERN.test(value)) return undefined;
  return value;
}
