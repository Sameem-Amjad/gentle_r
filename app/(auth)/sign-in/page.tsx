import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCard, AuthLink, Notice, SignInForm, UnconfiguredNotice } from "@/components/auth";
import { resolveNextPath, safeNextOrUndefined } from "@/lib/auth/paths";
import { hasSupabaseEnv } from "@/lib/env";
import { getCurrentUser } from "@/lib/supabase/server";
import { withNext } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  const params = await searchParams;
  const rawNext = Array.isArray(params.next) ? params.next[0] : params.next;
  const next = safeNextOrUndefined(rawNext);

  if (!hasSupabaseEnv()) return <UnconfiguredNotice />;

  // Already signed in: there is nothing to do here.
  const user = await getCurrentUser();
  if (user) redirect(resolveNextPath(rawNext));

  const cameFromReset = rawNext === "/reset-password";

  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to open your journal."
      footer={
        <>
          New here? <AuthLink href={withNext("/sign-up", next)}>Create an account</AuthLink>
        </>
      }
    >
      {cameFromReset ? (
        <Notice className="mb-5">
          That password link may have expired. You can{" "}
          <AuthLink href="/forgot-password">request a new one</AuthLink>, or sign in below if you remember
          your password. Nothing in your journal has changed.
        </Notice>
      ) : null}
      <SignInForm next={next} />
    </AuthCard>
  );
}
