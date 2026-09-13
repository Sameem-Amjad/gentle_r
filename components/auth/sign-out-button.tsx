"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui";
import { signOut } from "@/lib/auth/actions";
import { clearBrowserSession } from "./browser-session";

function SubmitButton({ className }: { className?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="secondary"
      className={className}
      loading={pending}
      loadingText="Signing out"
    >
      <LogOut className="size-4" aria-hidden="true" />
      Sign out
    </Button>
  );
}

/**
 * Signs out on the server (this device only). The browser client is nudged
 * at the same time so the header updates without a reload.
 */
export function SignOutButton({ className }: { className?: string }) {
  return (
    <form
      action={signOut}
      onSubmit={() => {
        void clearBrowserSession();
      }}
    >
      <SubmitButton className={className} />
    </form>
  );
}
