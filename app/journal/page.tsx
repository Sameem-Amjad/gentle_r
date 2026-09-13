import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { hasSupabaseEnv } from "@/lib/env";
import { JournalQueryError, listEntries } from "@/lib/journal/queries";
import type { EntryListEntry } from "@/lib/journal/schemas";
import { getCurrentUser } from "@/lib/supabase/server";
import { withNext } from "@/lib/utils";
import { Container } from "@/components/shell/container";
import { PageHeading } from "@/components/shell/page-heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyJournal } from "@/components/journal/empty-journal";
import { EntryList } from "@/components/journal/entry-list";
import { JournalUnconfigured } from "@/components/journal/journal-unconfigured";

// Depends on the session (or on runtime Supabase settings), so it is never prerendered.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Journal",
  robots: { index: false, follow: false },
};

function LoadFailed() {
  return (
    <Card glass className="p-6 sm:p-8">
      <h2 className="text-xl">We couldn&apos;t load your journal just now.</h2>
      <p className="text-muted mt-2">Your writing is safe. Please try again in a moment.</p>
      <Button asChild variant="secondary" className="mt-6">
        <Link href="/journal">Try again</Link>
      </Button>
    </Card>
  );
}

export default async function JournalPage() {
  if (!hasSupabaseEnv()) return <JournalUnconfigured />;

  const user = await getCurrentUser();
  if (!user) redirect(withNext("/sign-in", "/journal"));

  let entries: EntryListEntry[] | null = null;
  try {
    entries = await listEntries(user.id);
  } catch (error) {
    console.error("journal.list failed", error instanceof JournalQueryError ? error.code : "unknown");
  }

  return (
    <Container width="reading">
      <PageHeading
        title="My Journal"
        description="Private. Saved automatically as you write."
        actions={
          <Button asChild>
            <Link href="/journal/new">
              <Plus className="size-4" aria-hidden="true" />
              New entry
            </Link>
          </Button>
        }
      />

      {entries === null ? (
        <LoadFailed />
      ) : entries.length === 0 ? (
        <EmptyJournal />
      ) : (
        <EntryList entries={entries} />
      )}

      {entries && entries.length > 0 ? (
        <p className="text-muted mt-8 text-sm">
          <a
            href="/api/export"
            download
            className="hover:text-text underline underline-offset-4 transition-colors"
          >
            Download everything as a text file
          </a>
        </p>
      ) : null}
    </Container>
  );
}
