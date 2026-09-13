import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getAllLessonParams, lessonHref } from "@/lib/content";

/** Public pages only. Journal and account routes are private and excluded (see robots.ts). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url.replace(/\/$/, "");
  const lessons = await getAllLessonParams();

  const lessonEntries = lessons.map(({ book, lesson }): MetadataRoute.Sitemap[number] => ({
    url: `${base}${lessonHref(book, lesson)}`,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [
    { url: `${base}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/lessons`, changeFrequency: "monthly", priority: 0.9 },
    ...lessonEntries,
    { url: `${base}${siteConfig.links.help}`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}${siteConfig.links.privacy}`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}${siteConfig.links.terms}`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
