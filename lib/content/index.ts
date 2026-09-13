import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { cache } from "react";
import { bookSchema, lessonSchema, type Book, type Lesson, type LessonWithNav } from "./schema";

/**
 * Content loader. Reads JSON from ./content/books at build time (lesson pages
 * are statically generated) and validates it against the schema so a broken
 * file fails the build with a readable message instead of a blank page.
 */

const CONTENT_ROOT = path.join(process.cwd(), "content", "books");

export type LoadedBook = { book: Book; lessons: Lesson[] };

async function readJson(file: string): Promise<unknown> {
  const raw = await fs.readFile(file, "utf8");
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`Invalid JSON in ${path.relative(process.cwd(), file)}: ${String(error)}`);
  }
}

function describeIssues(file: string, issues: { path: PropertyKey[]; message: string }[]) {
  const lines = issues.map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`);
  return `Content validation failed for ${path.relative(process.cwd(), file)}:\n${lines.join("\n")}`;
}

async function loadBookDir(dir: string): Promise<LoadedBook> {
  const bookFile = path.join(dir, "book.json");
  const bookParsed = bookSchema.safeParse(await readJson(bookFile));
  if (!bookParsed.success) throw new Error(describeIssues(bookFile, bookParsed.error.issues));
  const book = bookParsed.data;

  const lessons: Lesson[] = [];
  for (const fileName of book.lessons) {
    const lessonFile = path.join(dir, "lessons", fileName);
    const parsed = lessonSchema.safeParse(await readJson(lessonFile));
    if (!parsed.success) throw new Error(describeIssues(lessonFile, parsed.error.issues));
    if (parsed.data.bookId !== book.bookId) {
      throw new Error(
        `${path.relative(process.cwd(), lessonFile)} has bookId "${parsed.data.bookId}" but lives in book "${book.bookId}".`,
      );
    }
    lessons.push(parsed.data);
  }

  const ids = new Set<string>();
  for (const lesson of lessons) {
    if (ids.has(lesson.lessonId)) {
      throw new Error(`Duplicate lessonId "${lesson.lessonId}" in book "${book.bookId}".`);
    }
    ids.add(lesson.lessonId);
  }

  lessons.sort((a, b) => a.order - b.order);
  return { book, lessons };
}

/** All books, sorted by title. Cached per request/render. */
export const getBooks = cache(async (): Promise<LoadedBook[]> => {
  const entries = await fs.readdir(CONTENT_ROOT, { withFileTypes: true });
  const books: LoadedBook[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    books.push(await loadBookDir(path.join(CONTENT_ROOT, entry.name)));
  }
  books.sort((a, b) => a.book.title.localeCompare(b.book.title));
  return books;
});

export const getBook = cache(async (bookId: string): Promise<LoadedBook | null> => {
  const books = await getBooks();
  return books.find((b) => b.book.bookId === bookId) ?? null;
});

export const getLesson = cache(
  async (bookId: string, lessonId: string): Promise<LessonWithNav | null> => {
    const loaded = await getBook(bookId);
    if (!loaded) return null;
    const index = loaded.lessons.findIndex((l) => l.lessonId === lessonId);
    if (index === -1) return null;
    const lesson = loaded.lessons[index];
    const pick = (l: Lesson | undefined) =>
      l ? { bookId: l.bookId, lessonId: l.lessonId, title: l.title } : null;
    return {
      ...lesson,
      book: {
        bookId: loaded.book.bookId,
        title: loaded.book.title,
        subtitle: loaded.book.subtitle,
        author: loaded.book.author,
      },
      previous: pick(loaded.lessons[index - 1]),
      next: pick(loaded.lessons[index + 1]),
      position: index + 1,
      total: loaded.lessons.length,
    };
  },
);

/** For generateStaticParams on the lesson route. */
export async function getAllLessonParams(): Promise<{ book: string; lesson: string }[]> {
  const books = await getBooks();
  return books.flatMap(({ book, lessons }) =>
    lessons.map((l) => ({ book: book.bookId, lesson: l.lessonId })),
  );
}

/** URL for a lesson. Single source of truth for the route shape. */
export function lessonHref(bookId: string, lessonId: string): string {
  return `/lessons/${bookId}/${lessonId}`;
}
