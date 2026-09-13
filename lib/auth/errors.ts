import type { AuthError } from "@supabase/supabase-js";

/**
 * Shared result shape for every auth Server Action used with useActionState.
 * Successful actions redirect, so a form only ever renders the `ok: false`
 * branch. The initial state is `{ ok: true }`: nothing has happened yet.
 */
export type FieldErrors = Record<string, string[] | undefined>;

export type AuthActionState = { ok: true } | { ok: false; error?: string; fieldErrors?: FieldErrors };

export const initialActionState: AuthActionState = { ok: true };

/** Calm, plain copy for everything that can go wrong. No blame, no urgency. */
export const authCopy = {
  generic: "Something went wrong. Please try again.",
  unconfigured: "Accounts are not set up on this preview yet.",
  invalidCredentials: "That email and password don't match.",
  emailNotConfirmed: "Please confirm your email first. The link is in your inbox.",
  rateLimited: "Too many attempts. Please wait a few minutes and try again.",
  sessionEnded: "Your session has ended. Please sign in again.",
  recoverySessionEnded:
    "This reset link is no longer active. Please request a new one and open it on this device.",
  weakPassword: "Please choose a longer or less common password.",
  samePassword: "Please choose a password that is different from your current one.",
  invalidEmail: "Please check the email address and try again.",
  signupsClosed: "New accounts are not open at the moment. Please try again later.",
  deleteFailed: "We couldn't delete your account. Nothing has changed. Please try again or email support.",
  confirmationMismatch: 'Please type "delete" to confirm.',
} as const;

/** The subset of an AuthError we ever look at. Never includes user content. */
export type AuthErrorLike = Pick<AuthError, "code" | "status" | "message">;

const RATE_LIMIT_CODES = new Set([
  "over_request_rate_limit",
  "over_email_send_rate_limit",
  "over_sms_send_rate_limit",
]);

const SESSION_CODES = new Set([
  "session_not_found",
  "session_expired",
  "refresh_token_not_found",
  "refresh_token_already_used",
  "bad_jwt",
  "no_authorization",
  "user_not_found",
  "reauthentication_needed",
]);

const EXPIRED_LINK_CODES = new Set(["otp_expired", "flow_state_expired"]);

export function isRateLimitError(error: AuthErrorLike | null | undefined): boolean {
  if (!error) return false;
  if (error.code && RATE_LIMIT_CODES.has(error.code)) return true;
  if (error.status === 429) return true;
  return /rate limit/i.test(error.message ?? "");
}

export function isSessionError(error: AuthErrorLike | null | undefined): boolean {
  if (!error) return false;
  if (error.code && SESSION_CODES.has(error.code)) return true;
  return error.status === 401;
}

/** True when an email link is past its lifetime (as opposed to malformed). */
export function isExpiredLinkError(error: AuthErrorLike | null | undefined): boolean {
  if (!error) return false;
  if (error.code && EXPIRED_LINK_CODES.has(error.code)) return true;
  return /expired/i.test(error.message ?? "");
}

/** True when Supabase says the address already has an account. */
export function isExistingUserError(error: AuthErrorLike | null | undefined): boolean {
  if (!error) return false;
  return error.code === "user_already_exists" || error.code === "email_exists";
}

/**
 * Maps a Supabase auth error to one kind sentence. Codes are preferred; a
 * few message patterns cover older servers that send no code.
 */
export function mapAuthError(error: AuthErrorLike | null | undefined): string {
  if (!error) return authCopy.generic;

  if (isRateLimitError(error)) return authCopy.rateLimited;

  switch (error.code) {
    case "invalid_credentials":
      return authCopy.invalidCredentials;
    case "email_not_confirmed":
      return authCopy.emailNotConfirmed;
    case "weak_password":
      return authCopy.weakPassword;
    case "same_password":
      return authCopy.samePassword;
    case "email_address_invalid":
    case "validation_failed":
      return authCopy.invalidEmail;
    case "signup_disabled":
    case "email_provider_disabled":
      return authCopy.signupsClosed;
    default:
      break;
  }

  if (isSessionError(error)) return authCopy.sessionEnded;

  const message = error.message ?? "";
  if (/invalid login credentials/i.test(message)) return authCopy.invalidCredentials;
  if (/email not confirmed/i.test(message)) return authCopy.emailNotConfirmed;
  if (/password/i.test(message) && /weak|short|at least/i.test(message)) return authCopy.weakPassword;

  return authCopy.generic;
}
