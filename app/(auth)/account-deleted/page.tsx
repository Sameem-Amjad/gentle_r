import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard, AuthLink, SessionSync } from "@/components/auth";
import { Hummingbird } from "@/components/art/hummingbird";
import { Button } from "@/components/ui";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Account deleted",
  robots: { index: false, follow: false },
};

export default function AccountDeletedPage() {
  return (
    <>
      <SessionSync />
      <AuthCard
        art={<Hummingbird className="mx-auto mb-4 h-16 w-20" float={false} />}
        title="Your account and your writing have been deleted."
        description={
          <>
            <p>Thank you for spending time here.</p>
            <p className="mt-2">
              Backups expire on the schedule described in our{" "}
              <AuthLink href={siteConfig.links.privacy}>privacy notice</AuthLink>.
            </p>
          </>
        }
        footer={<>The lessons are still here for you to read, with or without an account.</>}
      >
        <div className="flex flex-col gap-3">
          <Button asChild size="lg" className="w-full">
            <Link href="/">Go home</Link>
          </Button>
          <Button asChild variant="secondary" size="lg" className="w-full">
            <Link href="/lessons">Read a lesson</Link>
          </Button>
        </div>
      </AuthCard>
    </>
  );
}
