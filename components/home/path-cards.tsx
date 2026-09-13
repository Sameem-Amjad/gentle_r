import Link from "next/link";
import { ArrowRight, BookOpen, NotebookPen, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { lessonHref } from "@/lib/content";
import type { Lesson } from "@/lib/content/schema";
import { Card } from "@/components/ui/card";
import { LiftStaggerItem, StaggerGroup } from "@/components/lessons/lift";
import { stretchedCardClasses, stretchedLinkClasses } from "@/components/lessons/card-link";

interface PathCardProps {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  cta: string;
  children?: React.ReactNode;
}

function PathCard({ href, icon: Icon, title, description, cta, children }: PathCardProps) {
  return (
    <LiftStaggerItem className="h-full">
      <Card
        className={cn(
          "group hover:shadow-lift flex h-full flex-col p-6 transition-shadow duration-300 sm:p-7",
          stretchedCardClasses,
        )}
      >
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="bg-primary-soft text-primary flex size-10 shrink-0 items-center justify-center rounded-md"
          >
            <Icon className="size-5" />
          </span>
          <h2 className="text-text text-2xl">
            <Link href={href} className={cn("rounded-sm", stretchedLinkClasses)}>
              {title}
            </Link>
          </h2>
        </div>
        <p className="text-muted mt-4">{description}</p>
        {children}
        <span
          aria-hidden="true"
          className="text-primary mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-medium"
        >
          {cta}
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        </span>
      </Card>
    </LiftStaggerItem>
  );
}

interface PathCardsProps {
  lessons: Pick<Lesson, "bookId" | "lessonId" | "title">[];
}

/** The two ways in: read a lesson, or open the journal. */
export function PathCards({ lessons }: PathCardsProps) {
  return (
    <section aria-label="Start here" className="mt-6 sm:mt-8">
      <StaggerGroup delay={0.2} className="grid gap-4 sm:grid-cols-2">
        <PathCard
          href="/lessons"
          icon={BookOpen}
          title="Read a lesson"
          description="Three short lessons, free to read at your own pace. Each ends with one small, optional action."
          cta="Open the lessons"
        >
          {lessons.length > 0 ? (
            <ol className="relative z-10 mt-5 w-fit space-y-2" aria-label="Lesson titles">
              {lessons.map((lesson, index) => (
                <li key={lesson.lessonId}>
                  <Link
                    href={lessonHref(lesson.bookId, lesson.lessonId)}
                    className="text-muted hover:text-text inline-flex items-baseline gap-2 rounded-sm text-sm underline-offset-4 transition-colors duration-200 hover:underline"
                  >
                    <span aria-hidden="true" className="text-faint font-serif tabular-nums">
                      {index + 1}.
                    </span>
                    {lesson.title}
                  </Link>
                </li>
              ))}
            </ol>
          ) : null}
        </PathCard>

        <PathCard
          href="/journal"
          icon={NotebookPen}
          title="My Journal"
          description="Private. Saved automatically as you write. Yours to export or delete."
          cta="Open my journal"
        />
      </StaggerGroup>
      <p className="text-muted mt-5 text-center text-sm">
        Free to read. An account is only needed to save your writing.
      </p>
    </section>
  );
}
