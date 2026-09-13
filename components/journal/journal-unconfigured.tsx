import Link from "next/link";
import { Container } from "@/components/shell/container";
import { PageHeading } from "@/components/shell/page-heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/** Friendly notice for previews that run without Supabase. */
export function JournalUnconfigured() {
  return (
    <Container width="reading">
      <PageHeading title="My Journal" description="Private. Saved automatically as you write." />
      <Card glass className="p-6 sm:p-8">
        <h2 className="text-xl">Accounts are not set up on this preview yet.</h2>
        <p className="text-muted mt-2">
          The journal needs a sign-in, and this preview doesn&apos;t have one. The lessons are open to read
          now. Your journal will be here once accounts are switched on.
        </p>
        <Button asChild variant="secondary" className="mt-6">
          <Link href="/lessons">Read the lessons</Link>
        </Button>
      </Card>
    </Container>
  );
}
