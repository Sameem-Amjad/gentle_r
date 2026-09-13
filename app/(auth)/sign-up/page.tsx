import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCard, AuthLink, SignUpForm, UnconfiguredNotice } from "@/components/auth";
import { resolveNextPath, safeNextOrUndefined } from "@/lib/auth/paths";
import { hasSupabaseEnv } from "@/lib/env";
import { getCurrentUser } from "@/lib/supabase/server";
import { withNext } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Create an account",
  robots: { index: false, follow: false },
};

export default async function SignUpPage({ searchParams }: PageProps<"/sign-up">) {
  const params = await searchParams;
  const rawNext = Array.isArray(params.next) ? params.next[0] : params.next;
  const next = safeNextOrUndefined(rawNext);

  if (!hasSupabaseEnv()) return <UnconfiguredNotice />;

  const user = await getCurrentUser();
  if (user) redirect(resolveNextPath(rawNext));

  return (
    <AuthCard
      title="Create an account"
      description="An account keeps your journal private and lets you come back to it from any device. We only ask for an email address."
      footer={
        <>
          Already have an account? <AuthLink href={withNext("/sign-in", next)}>Sign in</AuthLink>
        </>
      }
    >
      <SignUpForm next={next} />
    </AuthCard>
  );
}
