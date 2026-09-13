import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site";
import { getAllLessonParams, getLesson, lessonHref } from "@/lib/content";
import { LessonTemplate } from "@/components/lessons/lesson-template";

type Params = Promise<{ book: string; lesson: string }>;

/** Only the lessons that exist in ./content are built; anything else is a 404. */
export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllLessonParams();
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { book, lesson: lessonId } = await params;
  const lesson = await getLesson(book, lessonId);
  if (!lesson) return { title: "Lesson not found" };
  const description = lesson.summary ?? lesson.subtitle ?? siteConfig.description;
  return {
    title: lesson.title,
    description,
    alternates: { canonical: lessonHref(lesson.bookId, lesson.lessonId) },
    openGraph: {
      title: lesson.title,
      description,
      type: "article",
    },
  };
}

/** One lesson, rendered through the shared template. Public and static. */
export default async function LessonPage({ params }: { params: Params }) {
  const { book, lesson: lessonId } = await params;
  const lesson = await getLesson(book, lessonId);
  if (!lesson) notFound();
  return <LessonTemplate lesson={lesson} />;
}
