"use client";

import Link from "next/link";
import { LogIn, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStatus } from "./auth-status-provider";

/**
 * Quiet account control in the header. Shows a neutral icon until the
 * client knows the auth state, then "Sign in" or "Account".
 */
export function AccountButton() {
  const { status } = useAuthStatus();
  const signedIn = status === "signed-in";
  const href = signedIn ? "/account" : "/sign-in";
  const label = signedIn ? "Account" : status === "unknown" ? "Account" : "Sign in";
  const Icon = signedIn || status === "unknown" ? UserRound : LogIn;

  return (
    <Button asChild variant="ghost" size="sm" className="gap-2 px-3">
      <Link href={href} aria-label={label}>
        <Icon className="size-5" aria-hidden="true" />
        <span className="hidden sm:inline">{label}</span>
      </Link>
    </Button>
  );
}
