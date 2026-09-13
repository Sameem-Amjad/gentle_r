import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getLesson } from "@/lib/content";
import { hasSupabaseEnv } from "@/lib/env";
import { getCurrentUser } from "@/lib/supabase/server";
import { withNext } from "@/lib/utils";
import { Container } from "@/components/shell/container";
import { EntryEditor } from "@/components/journal/entry-editor";
import { JournalUnconfigured } from "@/components/journal/journal-unconfigured";

// Depends on the session (or on runtime Supabase settings), so it is never prerendered.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "New entry",
  robots: { index: false, follow: false },
};

const LESSON_REF = /^[a-z0-9-]+\/[a-z0-9-]+$/;

export default async function NewEntryPage({ searchParams }: PageProps<"/journal/new">) {
  if (!hasSupabaseEnv()) return <JournalUnconfigured />;

  const user = await getCurrentUser();
  if (!user) redirect(withNext("/sign-in", "/journal/new"));

  const { lesson } = await searchParams;
  let suggestedTitlePlaceholder: string | undefined;
  if (typeof lesson === "string" && LESSON_REF.test(lesson)) {
    const [bookId, lessonId] = lesson.split("/");
    const found = await getLesson(bookId, lessonId);
    if (found) suggestedTitlePlaceholder = `Thoughts after: ${found.title}`;
  }

  return (
    <Container width="reading">
      <h1 className="sr-only">New journal entry</h1>
      <EntryEditor mode="new" suggestedTitlePlaceholder={suggestedTitlePlaceholder} />
    </Container>
  );
}
