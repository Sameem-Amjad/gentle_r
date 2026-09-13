import { cn } from "@/lib/utils";
import type { Lesson } from "@/lib/content/schema";
import { LessonCard } from "./lesson-card";
import { StaggerGroup } from "./lift";

interface LessonListProps {
  lessons: Lesson[];
  headingLevel?: 2 | 3;
  /** Animate when scrolled into view rather than on mount. */
  inView?: boolean;
  className?: string;
}

/** Grid of lesson cards with a gentle stagger. Shared by Home and /lessons. */
export function LessonList({ lessons, headingLevel = 2, inView = false, className }: LessonListProps) {
  return (
    <StaggerGroup
      inView={inView}
      className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}
      role="list"
      aria-label="Lessons"
    >
      {lessons.map((lesson, index) => (
        <div key={lesson.lessonId} role="listitem" className="h-full">
          <LessonCard lesson={lesson} index={index} headingLevel={headingLevel} />
        </div>
      ))}
    </StaggerGroup>
  );
}
