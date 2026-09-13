import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site";
import { getBook, getBooks } from "@/lib/content";
import { BookLessons } from "@/components/lessons/book-lessons";

type Params = Promise<{ book: string }>;

export const dynamicParams = false;

export async function generateStaticParams() {
  const books = await getBooks();
  return books.map(({ book }) => ({ book: book.bookId }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { book } = await params;
  const loaded = await getBook(book);
  if (!loaded) return { title: "Lessons" };
  return {
    title: "Lessons",
    description: loaded.book.description ?? siteConfig.description,
    alternates: { canonical: `/lessons/${loaded.book.bookId}` },
  };
}

/** Lessons list for one book, so /lessons/gentler works as well as /lessons. */
export default async function BookLessonsPage({ params }: { params: Params }) {
  const { book } = await params;
  const loaded = await getBook(book);
  if (!loaded) notFound();
  return <BookLessons loaded={loaded} />;
}
