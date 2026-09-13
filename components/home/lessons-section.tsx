import type { Book, Lesson } from "@/lib/content/schema";
import { Reveal } from "@/components/motion/reveal";
import { LessonList } from "@/components/lessons/lesson-list";

interface LessonsSectionProps {
  book: Pick<Book, "title" | "description">;
  lessons: Lesson[];
}

/** "The lessons" on the home page. Same cards as /lessons, h3 headings. */
export function LessonsSection({ book, lessons }: LessonsSectionProps) {
  if (lessons.length === 0) return null;
  return (
    <section aria-labelledby="home-lessons-heading" className="mt-16 sm:mt-20">
      <Reveal inView as="header" className="mb-6 sm:mb-8">
        <p className="text-accent text-sm font-medium tracking-[0.14em] uppercase">{book.title}</p>
        <h2 id="home-lessons-heading" className="text-text mt-2 text-3xl sm:text-4xl">
          The lessons
        </h2>
        {book.description ? <p className="text-muted mt-3 max-w-prose text-lg">{book.description}</p> : null}
      </Reveal>
      <LessonList lessons={lessons} headingLevel={3} inView />
    </section>
  );
}
