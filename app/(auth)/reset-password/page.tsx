import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCard, AuthLink, ResetPasswordForm, UnconfiguredNotice } from "@/components/auth";
import { hasSupabaseEnv } from "@/lib/env";
import { getCurrentUser } from "@/lib/supabase/server";

// Depends on the session (or on runtime Supabase settings), so it is never prerendered.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Choose a new password",
  robots: { index: false, follow: false },
};

/**
 * Reached from a recovery email (the confirm route signs the person in first)
 * or from the account page. proxy.ts redirects signed-out visitors, and the
 * page checks again here.
 */
export default async function ResetPasswordPage() {
  if (!hasSupabaseEnv()) return <UnconfiguredNotice />;

  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?next=/reset-password");

  return (
    <AuthCard
      title="Choose a new password"
      description="Changing your password does not affect your journal."
      footer={
        <>
          Changed your mind? <AuthLink href="/account">Back to your account</AuthLink>
        </>
      }
    >
      <ResetPasswordForm />
    </AuthCard>
  );
}
