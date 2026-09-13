import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { siteConfig } from "@/config/site";
import { getAllLessonParams, lessonHref } from "@/lib/content";

describe("sitemap", () => {
  it("lists only public pages, including every lesson", async () => {
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);
    const base = siteConfig.url.replace(/\/$/, "");

    expect(urls).toContain(`${base}/`);
    expect(urls).toContain(`${base}/lessons`);
    expect(urls).toContain(`${base}${siteConfig.links.help}`);
    expect(urls).toContain(`${base}${siteConfig.links.privacy}`);
    expect(urls).toContain(`${base}${siteConfig.links.terms}`);

    for (const { book, lesson } of await getAllLessonParams()) {
      expect(urls).toContain(`${base}${lessonHref(book, lesson)}`);
    }

    expect(urls.some((u) => u.includes("/journal") || u.includes("/account"))).toBe(false);
    expect(new Set(urls).size).toBe(urls.length);
  });
});
