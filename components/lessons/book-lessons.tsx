import type { LoadedBook } from "@/lib/content";
import { Container } from "@/components/shell/container";
import { PageHeading } from "@/components/shell/page-heading";
import { LessonList } from "./lesson-list";

/** Lessons list page body for one book. Used by /lessons and /lessons/[book]. */
export function BookLessons({ loaded }: { loaded: LoadedBook }) {
  const { book, lessons } = loaded;
  return (
    <Container width="wide">
      <PageHeading eyebrow={book.title} title="Lessons" description={book.description} />
      <LessonList lessons={lessons} headingLevel={2} />
      <p className="text-muted mt-8 text-sm">Read in any order. Come back whenever you like.</p>
    </Container>
  );
}
