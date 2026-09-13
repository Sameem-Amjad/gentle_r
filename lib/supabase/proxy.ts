import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/env";

/** Paths that require a signed-in user. Pages re-check on the server too. */
const PROTECTED_PREFIXES = ["/journal", "/account", "/reset-password"];

/**
 * Refreshes the Supabase session cookie on every matched request and
 * redirects signed-out visitors away from private areas. This is an
 * optimistic check only; every page, action and route handler verifies the
 * user again and the database enforces row-level security.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = getSupabaseUrl();
  const key = getSupabasePublishableKey();
  const pathname = request.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  // Public pages keep working while Supabase is not configured yet.
  if (!url || !key) {
    if (isProtected) {
      const to = request.nextUrl.clone();
      to.pathname = "/sign-in";
      to.searchParams.set("next", pathname);
      return NextResponse.redirect(to);
    }
    return response;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        Object.entries(headers ?? {}).forEach(([k, v]) =>
          response.headers.set(k, v),
        );
      },
    },
  });

  // Do not run code between createServerClient and getClaims: a refreshed
  // token must be written back before anything else reads the session.
  const { data } = await supabase.auth.getClaims();
  const isSignedIn = Boolean(data?.claims?.sub);

  if (!isSignedIn && isProtected) {
    const to = request.nextUrl.clone();
    to.pathname = "/sign-in";
    to.search = "";
    to.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(to);
  }

  return response;
}
