import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { LessonWithNav } from "@/lib/content/schema";
import { Container } from "@/components/shell/container";
import { Reveal } from "@/components/motion/reveal";
import { ContentBlocks } from "./content-blocks";
import { Encouragement } from "./encouragement";
import { LessonNav } from "./lesson-nav";
import { PlaceholderBadge } from "./placeholder-badge";
import { ReflectionPrompts } from "./reflection-prompts";
import { SmallActionCard } from "./small-action-card";
import { SourceList } from "./source-list";

/**
 * The single reusable lesson layout. Every lesson JSON file renders through
 * this template, so a copy change never needs a code change.
 */
export function LessonTemplate({ lesson }: { lesson: LessonWithNav }) {
  return (
    <Container width="reading" as="article" className="pb-4">
      <div className="surface-glass border-border/60 shadow-soft rounded-xl border px-5 py-8 sm:px-10 sm:py-12">
        <Reveal as="header">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <p className="text-accent text-sm font-medium tracking-[0.14em] uppercase">
              Lesson {lesson.position} of {lesson.total} · {lesson.book.title}
            </p>
            <Link
              href="/lessons"
              className="text-muted hover:text-text inline-flex items-center gap-1.5 rounded-sm text-sm transition-colors duration-200"
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              All lessons
            </Link>
          </div>
          <h1 className="text-text mt-4 text-3xl sm:text-4xl md:text-[2.75rem]">{lesson.title}</h1>
          {lesson.subtitle ? (
            <p className="text-muted mt-3 font-serif text-xl leading-snug">{lesson.subtitle}</p>
          ) : null}
          <PlaceholderBadge status={lesson.status} className="mt-4" />
        </Reveal>

        <Reveal delay={0.08} className="prose-lesson text-text mt-8 sm:mt-10">
          <ContentBlocks blocks={lesson.teaching} />
        </Reveal>

        <Reveal inView className="mt-12">
          <SmallActionCard action={lesson.smallAction} />
        </Reveal>

        {lesson.sources.length > 0 ? (
          <Reveal inView className="mt-12">
            <SourceList sources={lesson.sources} />
          </Reveal>
        ) : null}

        {lesson.reflectionQuestions.length > 0 ? (
          <Reveal inView className="mt-12">
            <ReflectionPrompts
              questions={lesson.reflectionQuestions}
              bookId={lesson.bookId}
              lessonId={lesson.lessonId}
            />
          </Reveal>
        ) : null}

        {lesson.encouragement ? (
          <Reveal inView className="mt-12">
            <Encouragement text={lesson.encouragement} />
          </Reveal>
        ) : null}
      </div>

      <Reveal inView className="mt-8 sm:mt-10">
        <LessonNav previous={lesson.previous} next={lesson.next} />
      </Reveal>
    </Container>
  );
}
