import { describe, expect, it } from "vitest";
import { getAllLessonParams, getBook, getBooks, getLesson, lessonHref } from "@/lib/content";
import { lessonSchema } from "@/lib/content/schema";

describe("content loader", () => {
  it("loads every book and lesson without validation errors", async () => {
    const books = await getBooks();
    expect(books.length).toBeGreaterThan(0);
    for (const { book, lessons } of books) {
      expect(lessons.length).toBe(book.lessons.length);
      for (const lesson of lessons) {
        expect(lesson.bookId).toBe(book.bookId);
        expect(lesson.teaching.length).toBeGreaterThan(0);
        expect(lesson.smallAction.blocks.length).toBeGreaterThan(0);
      }
    }
  });

  it("ships exactly three lessons in the default book", async () => {
    const loaded = await getBook("gentler");
    expect(loaded).not.toBeNull();
    expect(loaded!.lessons).toHaveLength(3);
    expect(loaded!.lessons.map((l) => l.order)).toEqual([1, 2, 3]);
  });

  it("provides previous/next navigation and positions", async () => {
    const params = await getAllLessonParams();
    expect(params).toHaveLength(3);
    const first = await getLesson(params[0].book, params[0].lesson);
    const last = await getLesson(params[2].book, params[2].lesson);
    expect(first?.previous).toBeNull();
    expect(first?.next?.lessonId).toBe(params[1].lesson);
    expect(first?.position).toBe(1);
    expect(first?.total).toBe(3);
    expect(last?.next).toBeNull();
    expect(last?.position).toBe(3);
  });

  it("returns null for unknown identifiers", async () => {
    expect(await getBook("nope")).toBeNull();
    expect(await getLesson("gentler", "nope")).toBeNull();
  });

  it("builds stable lesson URLs", () => {
    expect(lessonHref("gentler", "arriving")).toBe("/lessons/gentler/arriving");
  });

  it("rejects identifiers that are not URL-safe", () => {
    const result = lessonSchema.safeParse({
      schemaVersion: 1,
      bookId: "Gentle R",
      lessonId: "x",
      order: 1,
      title: "t",
      teaching: [{ type: "paragraph", text: "hello" }],
      smallAction: { blocks: [{ type: "paragraph", text: "do" }] },
    });
    expect(result.success).toBe(false);
  });
});
