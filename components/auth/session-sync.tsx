"use client";

import * as React from "react";
import { useAuthStatus } from "@/components/shell/auth-status-provider";

/**
 * After a server action changes the session (sign in, sign out, deletion),
 * the header's client-side auth status can lag until a full reload. This
 * re-reads the cookies once and nudges the browser client so the header
 * updates. Purely cosmetic; renders nothing.
 */
export function SessionSync() {
  const { status } = useAuthStatus();

  React.useEffect(() => {
    if (status === "unknown" || status === "unconfigured") return;
    let cancelled = false;

    (async () => {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data } = await supabase.auth.getSession();
        if (cancelled) return;

        if (status === "signed-in" && !data.session) {
          await supabase.auth.signOut({ scope: "local" });
        } else if (status === "signed-out" && data.session) {
          await supabase.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          });
        }
      } catch {
        // Cosmetic only.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [status]);

  return null;
}
