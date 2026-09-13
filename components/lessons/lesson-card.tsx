import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { lessonHref } from "@/lib/content";
import type { Lesson } from "@/lib/content/schema";
import { Card } from "@/components/ui/card";
import { LiftStaggerItem } from "./lift";
import { PlaceholderBadge } from "./placeholder-badge";
import { stretchedCardClasses, stretchedLinkClasses } from "./card-link";

interface LessonCardProps {
  lesson: Pick<Lesson, "bookId" | "lessonId" | "title" | "subtitle" | "summary" | "status">;
  /** 0-based position in the list; shown as "01", "02"... */
  index: number;
  /** Heading level for the title. 3 on the home page (under an h2), 2 on the lessons page. */
  headingLevel?: 2 | 3;
}

/**
 * One lesson in a list. The whole card is the click target for "Read"; the
 * accessible name stays short ("Read Arriving").
 */
export function LessonCard({ lesson, index, headingLevel = 2 }: LessonCardProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const number = String(index + 1).padStart(2, "0");
  const href = lessonHref(lesson.bookId, lesson.lessonId);

  return (
    <LiftStaggerItem className="h-full">
      <Card
        className={cn(
          "group hover:shadow-lift flex h-full flex-col p-6 transition-shadow duration-300",
          stretchedCardClasses,
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <span aria-hidden="true" className="text-accent/80 font-serif text-3xl leading-none">
            {number}
          </span>
          <PlaceholderBadge status={lesson.status} />
        </div>

        <Heading className="text-text mt-5 text-xl">{lesson.title}</Heading>
        {lesson.subtitle ? <p className="text-muted mt-1 text-sm">{lesson.subtitle}</p> : null}
        {lesson.summary ? (
          <p className="text-muted mt-3 text-[0.95rem] leading-relaxed">{lesson.summary}</p>
        ) : null}

        <p className="mt-auto pt-6">
          <Link
            href={href}
            className={cn(
              "text-primary inline-flex items-center gap-1.5 text-sm font-medium",
              stretchedLinkClasses,
            )}
          >
            Read
            <span className="sr-only"> {lesson.title}</span>
            <ArrowRight
              aria-hidden="true"
              className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
            />
          </Link>
        </p>
      </Card>
    </LiftStaggerItem>
  );
}
