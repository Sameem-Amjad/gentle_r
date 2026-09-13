import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site";
import { getBook } from "@/lib/content";
import { BookLessons } from "@/components/lessons/book-lessons";

export async function generateMetadata(): Promise<Metadata> {
  const loaded = await getBook(siteConfig.defaultBookId);
  return {
    title: "Lessons",
    description: loaded?.book.description ?? siteConfig.description,
    alternates: { canonical: "/lessons" },
  };
}

/** Lessons list for the default book. Public and static. */
export default async function LessonsPage() {
  const loaded = await getBook(siteConfig.defaultBookId);
  if (!loaded) notFound();
  return <BookLessons loaded={loaded} />;
}
