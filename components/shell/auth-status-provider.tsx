"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { hasSupabaseEnv } from "@/lib/env";

type Status = "unknown" | "signed-out" | "signed-in" | "unconfigured";

interface AuthStatusValue {
  status: Status;
  user: Pick<User, "id" | "email"> | null;
}

const AuthStatusContext = React.createContext<AuthStatusValue>({ status: "unknown", user: null });

const UNKNOWN: AuthStatusValue = { status: "unknown", user: null };
const UNCONFIGURED: AuthStatusValue = { status: "unconfigured", user: null };

function fromUser(u: User | null | undefined): AuthStatusValue {
  return u ? { status: "signed-in", user: { id: u.id, email: u.email } } : { status: "signed-out", user: null };
}

/**
 * Lightweight client-side auth status for the shell (header). Pages stay
 * cacheable; only this small piece asks the browser Supabase client who is
 * signed in. Never used for authorisation: the server and RLS decide that.
 */
export function AuthStatusProvider({ children }: { children: React.ReactNode }) {
  const configured = hasSupabaseEnv();
  const pathname = usePathname();
  const [value, setValue] = React.useState<AuthStatusValue>(configured ? UNKNOWN : UNCONFIGURED);

  React.useEffect(() => {
    if (!configured) return;
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    import("@/lib/supabase/client").then(({ createClient }) => {
      if (cancelled) return;
      const supabase = createClient();
      supabase.auth.getSession().then(({ data }) => {
        if (!cancelled) setValue(fromUser(data.session?.user));
      });
      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!cancelled) setValue(fromUser(session?.user));
      });
      unsubscribe = () => sub.subscription.unsubscribe();
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [configured]);

  // Server Actions (sign in, sign out, deletion) change the session cookie
  // and then navigate without a full reload, which onAuthStateChange does not
  // see. Re-reading the cookie-backed session after each navigation keeps the
  // header in step. Cosmetic only; authorisation stays on the server.
  React.useEffect(() => {
    if (!configured) return;
    let cancelled = false;
    import("@/lib/supabase/client").then(({ createClient }) => {
      if (cancelled) return;
      createClient()
        .auth.getSession()
        .then(({ data }) => {
          if (!cancelled) setValue(fromUser(data.session?.user));
        })
        .catch(() => {
          // Leave the current status in place.
        });
    });
    return () => {
      cancelled = true;
    };
  }, [configured, pathname]);

  return <AuthStatusContext.Provider value={value}>{children}</AuthStatusContext.Provider>;
}

export function useAuthStatus(): AuthStatusValue {
  return React.useContext(AuthStatusContext);
}
