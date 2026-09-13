import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { lessonHref } from "@/lib/content";
import type { LessonWithNav } from "@/lib/content/schema";
import { Button } from "@/components/ui/button";
import { Lift } from "./lift";

type NavTarget = LessonWithNav["previous"];

interface LessonNavProps {
  previous: NavTarget;
  next: NavTarget;
}

const cardClasses =
  "group block h-full rounded-lg border border-border bg-surface p-5 shadow-soft transition-shadow duration-300 hover:shadow-lift";

/** Previous / next lesson cards plus a way back to the list. No completion state. */
export function LessonNav({ previous, next }: LessonNavProps) {
  return (
    <nav aria-label="Lesson navigation">
      <div className="grid gap-4 sm:grid-cols-2">
        {previous ? (
          <Lift className="h-full">
            <Link href={lessonHref(previous.bookId, previous.lessonId)} className={cardClasses}>
              <span className="text-muted inline-flex items-center gap-1.5 text-sm">
                <ArrowLeft
                  aria-hidden="true"
                  className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5"
                />
                Previous
              </span>
              <span className="text-text mt-2 block font-serif text-lg">{previous.title}</span>
            </Link>
          </Lift>
        ) : null}
        {next ? (
          <Lift className={cn("h-full", !previous && "sm:col-start-2")}>
            <Link
              href={lessonHref(next.bookId, next.lessonId)}
              className={cn(cardClasses, "text-left sm:text-right")}
            >
              <span className="text-muted inline-flex items-center gap-1.5 text-sm">
                Next
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
                />
              </span>
              <span className="text-text mt-2 block font-serif text-lg">{next.title}</span>
            </Link>
          </Lift>
        ) : null}
      </div>
      <div className="mt-6 flex justify-center">
        <Button asChild variant="link" size="sm">
          <Link href="/lessons">All lessons</Link>
        </Button>
      </div>
    </nav>
  );
}
