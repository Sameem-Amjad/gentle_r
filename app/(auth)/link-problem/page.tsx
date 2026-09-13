import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth";
import { Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "Link problem",
  robots: { index: false, follow: false },
};

export default async function LinkProblemPage({ searchParams }: PageProps<"/link-problem">) {
  const { reason } = await searchParams;
  const expired = reason === "expired";

  return (
    <AuthCard
      eyebrow="Email link"
      title={expired ? "This link has expired." : "This link has expired or was already used."}
      description={
        <>
          <p>Email links work once and stop working after a while.</p>
          <p className="mt-2">
            Nothing has been deleted. Your account and your journal are exactly as you left them.
          </p>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Button asChild size="lg" className="w-full">
          <Link href="/sign-in">Sign in</Link>
        </Button>
        <Button asChild variant="secondary" size="lg" className="w-full">
          <Link href="/forgot-password">Send a new password link</Link>
        </Button>
        <Button asChild variant="ghost" size="lg" className="w-full">
          <Link href="/sign-up">Create an account</Link>
        </Button>
      </div>
    </AuthCard>
  );
}
