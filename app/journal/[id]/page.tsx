import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { hasSupabaseEnv } from "@/lib/env";
import { getEntry } from "@/lib/journal/queries";
import { isEntryId } from "@/lib/journal/schemas";
import { getCurrentUser } from "@/lib/supabase/server";
import { withNext } from "@/lib/utils";
import { Container } from "@/components/shell/container";
import { EntryEditor } from "@/components/journal/entry-editor";
import { JournalUnconfigured } from "@/components/journal/journal-unconfigured";

export const metadata: Metadata = {
  title: "Journal entry",
  robots: { index: false, follow: false },
};

export default async function EntryPage({ params }: PageProps<"/journal/[id]">) {
  const { id } = await params;

  if (!hasSupabaseEnv()) return <JournalUnconfigured />;

  const user = await getCurrentUser();
  if (!user) redirect(withNext("/sign-in", `/journal/${id}`));

  if (!isEntryId(id)) notFound();

  const row = await getEntry(user.id, id);
  if (!row) notFound();

  const entry = {
    id: row.id,
    title: row.title,
    body: row.body,
    created_at: row.created_at,
    updated_at: row.updated_at,
    revision: row.revision,
  };

  return (
    <Container width="reading">
      <h1 className="sr-only">Journal entry</h1>
      <EntryEditor key={entry.id} mode="edit" entry={entry} />
    </Container>
  );
}
