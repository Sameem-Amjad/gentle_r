import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { AuthCard } from "./auth-card";

/**
 * Shown in place of any account or journal screen while Supabase settings
 * are missing, so the first preview runs without a database.
 */
export function UnconfiguredNotice({ children }: { children?: React.ReactNode }) {
  return (
    <AuthCard
      eyebrow="Preview"
      title="Accounts are not set up on this preview yet."
      description="Signing in, registering and the private journal need a connected database. The lessons work without one."
    >
      {children}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild>
          <Link href="/lessons">Read the lessons</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </AuthCard>
  );
}
