"use server";

import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import type { z } from "zod";
import { getSiteOrigin, hasSupabaseEnv } from "@/lib/env";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import {
  authCopy,
  isExistingUserError,
  isRateLimitError,
  isSessionError,
  mapAuthError,
  type AuthActionState,
} from "./errors";
import { isDemoAccount } from "./demo";
import { resolveNextPath } from "./paths";
import {
  deleteAccountSchema,
  flattenFieldErrors,
  forgotPasswordSchema,
  formDataToObject,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from "./schemas";

/*
 * Every action: validate with zod, talk to Supabase inside try/catch, turn
 * failures into calm copy, and only then redirect (redirect() throws, so it
 * must stay outside try/catch). Nothing here logs emails, passwords or
 * anything a person typed; only error codes and statuses.
 */

function fail(error: string): AuthActionState {
  return { ok: false, error };
}

function invalid(error: z.ZodError): AuthActionState {
  return { ok: false, fieldErrors: flattenFieldErrors(error) };
}

function fieldFailure(field: string, message: string): AuthActionState {
  return { ok: false, fieldErrors: { [field]: [message] } };
}

function logAuthFailure(step: string, err: unknown): void {
  const record = typeof err === "object" && err !== null ? (err as Record<string, unknown>) : {};
  const code = typeof record.code === "string" ? record.code : undefined;
  const status = typeof record.status === "number" ? record.status : undefined;
  const name = err instanceof Error ? err.name : undefined;
  console.error(`[auth] ${step} failed`, { code, status, name });
}

/** Absolute URL for the email-link landing route, based on the request origin. */
async function confirmUrl(next: string): Promise<string> {
  const origin = (await headers()).get("origin");
  return `${getSiteOrigin(origin)}/auth/confirm?next=${encodeURIComponent(next)}`;
}

/**
 * Last-resort cleanup: drop Supabase auth cookies even if the sign-out call
 * itself failed (for example after the account row is already gone).
 */
async function clearSupabaseCookies(): Promise<void> {
  try {
    const store = await cookies();
    for (const cookie of store.getAll()) {
      if (/^sb-.+-auth-token/.test(cookie.name)) store.delete(cookie.name);
    }
  } catch {
    // Cookies may be read-only in this context; the proxy will refresh state.
  }
}

// ---------------------------------------------------------------------------
// Sign in
// ---------------------------------------------------------------------------
export async function signIn(_prev: AuthActionState, formData: FormData): Promise<AuthActionState> {
  if (!hasSupabaseEnv()) return fail(authCopy.unconfigured);

  const parsed = signInSchema.safeParse(formDataToObject(formData, ["email", "password", "next"]));
  if (!parsed.success) return invalid(parsed.error);
  const { email, password, next } = parsed.data;

  let failure: string | null = null;
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) failure = mapAuthError(error);
  } catch (err) {
    logAuthFailure("sign-in", err);
    failure = authCopy.generic;
  }
  if (failure) return fail(failure);

  revalidatePath("/", "layout");
  redirect(resolveNextPath(next));
}

// ---------------------------------------------------------------------------
// Sign up
// ---------------------------------------------------------------------------
export async function signUp(_prev: AuthActionState, formData: FormData): Promise<AuthActionState> {
  if (!hasSupabaseEnv()) return fail(authCopy.unconfigured);

  const parsed = signUpSchema.safeParse(
    formDataToObject(formData, ["email", "password", "confirmPassword", "accept", "next"]),
  );
  if (!parsed.success) return invalid(parsed.error);
  const { email, password, next } = parsed.data;
  const destination = resolveNextPath(next);

  let failure: AuthActionState | null = null;
  let signedInImmediately = false;
  try {
    const supabase = await createClient();
    const emailRedirectTo = await confirmUrl(destination);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo },
    });

    if (error) {
      // An address that already has an account continues to the same page as a
      // new one, so the form never reveals which addresses are registered.
      if (!isExistingUserError(error)) {
        failure =
          error.code === "weak_password"
            ? fieldFailure("password", authCopy.weakPassword)
            : fail(mapAuthError(error));
      }
    } else if (data.session) {
      // Email confirmation is switched off on this project: the person is
      // already signed in, so there is no email to wait for.
      signedInImmediately = true;
    }
  } catch (err) {
    logAuthFailure("sign-up", err);
    failure = fail(authCopy.generic);
  }
  if (failure) return failure;

  if (signedInImmediately) {
    revalidatePath("/", "layout");
    redirect(destination);
  }
  redirect("/check-email?type=signup");
}

// ---------------------------------------------------------------------------
// Forgot password
// ---------------------------------------------------------------------------
export async function requestPasswordReset(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!hasSupabaseEnv()) return fail(authCopy.unconfigured);

  const parsed = forgotPasswordSchema.safeParse(formDataToObject(formData, ["email"]));
  if (!parsed.success) return invalid(parsed.error);
  const { email } = parsed.data;

  let failure: string | null = null;
  try {
    const supabase = await createClient();
    const redirectTo = await confirmUrl("/reset-password");
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) {
      if (isRateLimitError(error)) {
        failure = authCopy.rateLimited;
      } else if ((error.status ?? 0) >= 500) {
        // The email could not be sent at all; saying so is kinder than a
        // silent wait. It reveals nothing about the address.
        logAuthFailure("password-reset", error);
        failure = authCopy.generic;
      }
      // Any other response (including "no such user") continues to the same
      // page, so the form never confirms whether an address is registered.
    }
  } catch (err) {
    logAuthFailure("password-reset", err);
    failure = authCopy.generic;
  }
  if (failure) return fail(failure);

  redirect("/check-email?type=recovery");
}

// ---------------------------------------------------------------------------
// Update password (recovery link or signed-in change)
// ---------------------------------------------------------------------------
export async function updatePassword(_prev: AuthActionState, formData: FormData): Promise<AuthActionState> {
  if (!hasSupabaseEnv()) return fail(authCopy.unconfigured);

  const user = await getCurrentUser();
  if (!user) return fail(authCopy.recoverySessionEnded);
  if (isDemoAccount(user)) return fail(authCopy.demoLocked);

  const parsed = resetPasswordSchema.safeParse(formDataToObject(formData, ["password", "confirmPassword"]));
  if (!parsed.success) return invalid(parsed.error);
  const { password } = parsed.data;

  let failure: AuthActionState | null = null;
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      if (error.code === "weak_password") {
        failure = fieldFailure("password", authCopy.weakPassword);
      } else if (error.code === "same_password") {
        failure = fieldFailure("password", authCopy.samePassword);
      } else if (error.code === "reauthentication_needed" || isSessionError(error)) {
        failure = fail(authCopy.recoverySessionEnded);
      } else {
        failure = fail(mapAuthError(error));
      }
    }
  } catch (err) {
    logAuthFailure("update-password", err);
    failure = fail(authCopy.generic);
  }
  if (failure) return failure;

  revalidatePath("/", "layout");
  redirect("/account?updated=password");
}

// ---------------------------------------------------------------------------
// Sign out (this device only; other devices keep their sessions)
// ---------------------------------------------------------------------------
export async function signOut(): Promise<void> {
  if (hasSupabaseEnv()) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.signOut({ scope: "local" });
      if (error) {
        logAuthFailure("sign-out", error);
        await clearSupabaseCookies();
      }
    } catch (err) {
      logAuthFailure("sign-out", err);
      await clearSupabaseCookies();
    }
  }

  revalidatePath("/", "layout");
  redirect("/");
}

// ---------------------------------------------------------------------------
// Delete account
// ---------------------------------------------------------------------------
export async function deleteAccount(_prev: AuthActionState, formData: FormData): Promise<AuthActionState> {
  if (!hasSupabaseEnv()) return fail(authCopy.unconfigured);

  const user = await getCurrentUser();
  if (!user) return fail(authCopy.sessionEnded);
  if (isDemoAccount(user)) return fail(authCopy.demoLocked);

  // The dialog checks this too; the server is the one that counts.
  const parsed = deleteAccountSchema.safeParse(formDataToObject(formData, ["confirmation"]));
  if (!parsed.success) return invalid(parsed.error);

  let deleted = false;
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("delete_own_account");
    if (error) {
      logAuthFailure("delete-account", error);
      return fail(authCopy.deleteFailed);
    }
    deleted = true;

    // The account row is gone; the server may reject the sign-out call, so
    // make sure the cookies go regardless.
    const { error: signOutError } = await supabase.auth.signOut({ scope: "local" });
    if (signOutError) await clearSupabaseCookies();
  } catch (err) {
    if (!deleted) {
      logAuthFailure("delete-account", err);
      return fail(authCopy.deleteFailed);
    }
    await clearSupabaseCookies();
  }

  revalidatePath("/", "layout");
  redirect("/account-deleted");
}
