import type { Metadata } from "next";
import { AuthCard, AuthLink, ForgotPasswordForm, UnconfiguredNotice } from "@/components/auth";
import { hasSupabaseEnv } from "@/lib/env";

// Depends on the session (or on runtime Supabase settings), so it is never prerendered.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Forgot your password",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  if (!hasSupabaseEnv()) return <UnconfiguredNotice />;

  return (
    <AuthCard
      title="Forgot your password?"
      description={
        <>
          <p>Enter your email and we&apos;ll send a link to choose a new one.</p>
          <p className="mt-2">
            Resetting your password does not delete anything. Your journal stays exactly as it is.
          </p>
        </>
      }
      footer={
        <>
          Remembered it? <AuthLink href="/sign-in">Back to sign in</AuthLink>
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
