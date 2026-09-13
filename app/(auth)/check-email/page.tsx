import type { Metadata } from "next";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { AuthCard, AuthLink } from "@/components/auth";
import { Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "Check your email",
  robots: { index: false, follow: false },
};

const nextStep = {
  signup: "Open it to confirm your account. After that you can sign in and start writing.",
  recovery: "Open it to choose a new password. Nothing in your journal changes.",
  other: "Open it to continue.",
} as const;

export default async function CheckEmailPage({ searchParams }: PageProps<"/check-email">) {
  const { type } = await searchParams;
  const kind: keyof typeof nextStep =
    type === "signup" ? "signup" : type === "recovery" ? "recovery" : "other";

  return (
    <AuthCard
      art={
        <span className="bg-primary-soft text-primary mx-auto mb-5 inline-flex size-12 items-center justify-center rounded-full">
          <MailCheck className="size-6" aria-hidden="true" />
        </span>
      }
      title="Check your email"
      description={<p>We&apos;ve sent a link to your email address.</p>}
      footer={
        kind === "recovery" ? (
          <>
            No email after a while? <AuthLink href="/forgot-password">Send another link</AuthLink>
          </>
        ) : (
          <>
            Used the wrong address? <AuthLink href="/sign-up">Start again</AuthLink>
          </>
        )
      }
    >
      <div className="text-muted space-y-4 text-sm leading-relaxed">
        <p className="text-text text-base">{nextStep[kind]}</p>
        <p>If it hasn&apos;t arrived after a few minutes, have a look in your spam or junk folder.</p>
        <p>
          The link works once and stops working after a while. If it has expired, you can ask for a new one.
        </p>
      </div>
      <div className="mt-6">
        <Button asChild variant="secondary" size="lg" className="w-full">
          <Link href="/sign-in">Back to sign in</Link>
        </Button>
      </div>
    </AuthCard>
  );
}
