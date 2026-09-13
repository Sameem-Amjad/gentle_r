import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { isExpiredLinkError, type AuthErrorLike } from "@/lib/auth/errors";
import { resolveNextPath } from "@/lib/auth/paths";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

/**
 * Landing route for every email link (confirmation and password recovery).
 *
 * Supports both link styles Supabase can send:
 *  - token_hash + type  (custom email templates; works on any device)
 *  - code               (PKCE redirect from the default templates)
 *
 * Tokens are only ever passed to Supabase, never logged or echoed.
 */
export const dynamic = "force-dynamic";

const EMAIL_OTP_TYPES: ReadonlySet<string> = new Set([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
]);

type Outcome = { kind: "ok"; next: string } | { kind: "problem"; reason: "expired" | "invalid" };

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const tokenHash = params.get("token_hash");
  const code = params.get("code");
  const rawType = params.get("type");
  const type: EmailOtpType | null = rawType && EMAIL_OTP_TYPES.has(rawType) ? rawType : null;

  const fallback = type === "recovery" ? "/reset-password" : "/journal";
  const next = resolveNextPath(params.get("next"), fallback);

  const outcome = await verify({ tokenHash, code, type, next, errorCode: params.get("error_code") });

  if (outcome.kind === "ok") redirect(outcome.next);
  redirect(`/link-problem?reason=${outcome.reason}`);
}

async function verify({
  tokenHash,
  code,
  type,
  next,
  errorCode,
}: {
  tokenHash: string | null;
  code: string | null;
  type: EmailOtpType | null;
  next: string;
  errorCode: string | null;
}): Promise<Outcome> {
  if (!hasSupabaseEnv()) return { kind: "problem", reason: "invalid" };

  // Supabase itself may bounce here with ?error_code=otp_expired and no token.
  if (!tokenHash && !code) {
    return { kind: "problem", reason: errorCode === "otp_expired" ? "expired" : "invalid" };
  }

  try {
    const supabase = await createClient();
    let error: AuthErrorLike | null;

    if (tokenHash) {
      if (!type) return { kind: "problem", reason: "invalid" };
      ({ error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash }));
    } else {
      ({ error } = await supabase.auth.exchangeCodeForSession(code as string));
    }

    if (!error) return { kind: "ok", next };
    return { kind: "problem", reason: isExpiredLinkError(error) ? "expired" : "invalid" };
  } catch (err) {
    console.error("[auth] confirm failed", err instanceof Error ? err.name : "unknown");
    return { kind: "problem", reason: "invalid" };
  }
}
