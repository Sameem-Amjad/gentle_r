import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Download, KeyRound, LogOut, TriangleAlert, UserRound } from "lucide-react";
import {
  DeleteAccountDialog,
  Notice,
  SessionSync,
  SignOutButton,
  UnconfiguredNotice,
} from "@/components/auth";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { Container } from "@/components/shell/container";
import { PageHeading } from "@/components/shell/page-heading";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { siteConfig } from "@/config/site";
import { hasSupabaseEnv } from "@/lib/env";
import { getCurrentUser } from "@/lib/supabase/server";
import { cn, formatDate } from "@/lib/utils";

// Depends on the session (or on runtime Supabase settings), so it is never prerendered.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your account",
  robots: { index: false, follow: false },
};

function SectionCard({
  icon,
  title,
  description,
  danger,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card className={cn(danger && "border-danger/40")}>
      <CardHeader className="flex items-start gap-4">
        <span
          className={cn(
            "mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-md",
            danger ? "bg-danger-soft text-danger" : "bg-primary-soft text-primary",
          )}
          aria-hidden="true"
        >
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
      </CardHeader>
      <CardContent className="pt-3 sm:pl-20">{children}</CardContent>
    </Card>
  );
}

export default async function AccountPage({ searchParams }: PageProps<"/account">) {
  if (!hasSupabaseEnv()) {
    return (
      <Container width="narrow" className="flex flex-1 flex-col justify-center py-4 sm:py-8">
        <UnconfiguredNotice />
      </Container>
    );
  }

  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?next=/account");

  const { updated } = await searchParams;
  const passwordUpdated = updated === "password";

  return (
    <Container width="reading">
      <SessionSync />
      <PageHeading
        eyebrow="Account"
        title="Your account"
        description="Everything here is about your account only. Your entries live in My Journal."
      />

      {passwordUpdated ? (
        <Notice tone="success" className="mb-6">
          Your password has been changed. Your journal is untouched.
        </Notice>
      ) : null}

      <Stagger className="space-y-5">
        <StaggerItem>
          <SectionCard
            icon={<UserRound className="size-5" />}
            title="Your account"
            description="We only keep your email address and your journal."
          >
            <dl className="grid gap-3 text-sm sm:grid-cols-[auto_1fr] sm:gap-x-8">
              <dt className="text-muted">Email</dt>
              <dd className="text-text font-medium break-all">{user.email ?? "No email on file"}</dd>
              <dt className="text-muted">Joined</dt>
              <dd className="text-text">{formatDate(user.created_at)}</dd>
            </dl>
          </SectionCard>
        </StaggerItem>

        <StaggerItem>
          <SectionCard
            icon={<Download className="size-5" />}
            title="Export your writing"
            description="A plain text file with every entry, its title and dates. Your entries stay here."
          >
            <Button asChild variant="secondary">
              <a href="/api/export" download>
                Download all entries (.txt)
              </a>
            </Button>
          </SectionCard>
        </StaggerItem>

        <StaggerItem>
          <SectionCard
            icon={<KeyRound className="size-5" />}
            title="Password"
            description="Changing your password does not affect your journal."
          >
            <Button asChild variant="secondary">
              <Link href="/reset-password">Change password</Link>
            </Button>
          </SectionCard>
        </StaggerItem>

        <StaggerItem>
          <SectionCard
            icon={<LogOut className="size-5" />}
            title="Sign out"
            description="Signs you out on this device. Your entries stay saved, and you can sign back in any time."
          >
            <SignOutButton />
          </SectionCard>
        </StaggerItem>

        <StaggerItem>
          <SectionCard
            icon={<TriangleAlert className="size-5" />}
            title="Delete account"
            description="Permanent, and yours to decide."
            danger
          >
            <div className="text-muted space-y-4 text-sm leading-relaxed">
              <p>
                Deleting your account removes your account and every journal entry, permanently. It cannot be
                undone.
              </p>
              <p>
                Backups expire on the schedule described in our{" "}
                <Link
                  href={siteConfig.links.privacy}
                  className="text-primary font-medium underline underline-offset-4"
                >
                  privacy notice
                </Link>
                . If you would like a copy of your writing, download it first.
              </p>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <DeleteAccountDialog />
              <Button asChild variant="ghost">
                <a href="/api/export" download>
                  Download my writing first
                </a>
              </Button>
            </div>
          </SectionCard>
        </StaggerItem>
      </Stagger>
    </Container>
  );
}
