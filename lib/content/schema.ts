import { z } from "zod";

/**
 * Lesson content schema (schemaVersion 1).
 *
 * Content lives in content/books/<bookId>/... as JSON. This schema is the
 * contract between the content files and the single reusable lesson
 * template. See docs/CONTENT.md for how to add or replace lessons.
 */

/** Stable identifier: lowercase letters, digits and hyphens. Used in URLs. */
export const idSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, digits and hyphens only");

export const contentBlockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("paragraph"), text: z.string().min(1) }),
  z.object({ type: z.literal("heading"), text: z.string().min(1) }),
  z.object({
    type: z.literal("quote"),
    text: z.string().min(1),
    attribution: z.string().optional(),
  }),
  z.object({
    type: z.literal("list"),
    items: z.array(z.string().min(1)).min(1),
    ordered: z.boolean().optional(),
  }),
]);

export const sourceLinkSchema = z.object({
  label: z.string().min(1),
  url: z.url(),
  note: z.string().optional(),
});

export const lessonStatusSchema = z.enum(["placeholder", "draft", "published"]);

export const lessonSchema = z.object({
  schemaVersion: z.literal(1),
  bookId: idSchema,
  lessonId: idSchema,
  /** 1-based display order inside the book. */
  order: z.number().int().positive(),
  /** "placeholder" shows a small preview badge when enabled in config/site.ts. */
  status: lessonStatusSchema.default("published"),
  title: z.string().min(1).max(160),
  subtitle: z.string().max(240).optional(),
  /** One or two sentences shown in lists. */
  summary: z.string().max(400).optional(),
  /** Main teaching text. */
  teaching: z.array(contentBlockSchema).min(1),
  /** One small, optional action. */
  smallAction: z.object({
    title: z.string().min(1).default("Small Action"),
    blocks: z.array(contentBlockSchema).min(1),
  }),
  /** Research / source links. Shown once, after the teaching. */
  sources: z.array(sourceLinkSchema).default([]),
  /** Read-only reflection prompts. No answers are collected. */
  reflectionQuestions: z.array(z.string().min(1)).default([]),
  /** Closing encouragement. */
  encouragement: z.string().optional(),
});

export const bookSchema = z.object({
  schemaVersion: z.literal(1),
  bookId: idSchema,
  title: z.string().min(1).max(160),
  subtitle: z.string().max(240).optional(),
  author: z.string().max(120).optional(),
  description: z.string().max(600).optional(),
  status: lessonStatusSchema.default("published"),
  /** Lesson file names (inside ./lessons) in display order. */
  lessons: z.array(z.string().min(1)).min(1),
});

export type ContentBlock = z.infer<typeof contentBlockSchema>;
export type SourceLink = z.infer<typeof sourceLinkSchema>;
export type Lesson = z.infer<typeof lessonSchema>;
export type Book = z.infer<typeof bookSchema>;
export type LessonStatus = z.infer<typeof lessonStatusSchema>;

/** Lesson plus list-friendly navigation data. */
export type LessonWithNav = Lesson & {
  book: Pick<Book, "bookId" | "title" | "subtitle" | "author">;
  previous: Pick<Lesson, "bookId" | "lessonId" | "title"> | null;
  next: Pick<Lesson, "bookId" | "lessonId" | "title"> | null;
  /** 1-based position and total for "Lesson 2 of 3". */
  position: number;
  total: number;
};
