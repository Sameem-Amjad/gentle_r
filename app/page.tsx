import { siteConfig } from "@/config/site";
import { getBook } from "@/lib/content";
import { Container } from "@/components/shell/container";
import { Hero } from "@/components/home/hero";
import { PathCards } from "@/components/home/path-cards";
import { LessonsSection } from "@/components/home/lessons-section";

/** Public home page. Static: no cookies, no user data. */
export default async function Home() {
  const loaded = await getBook(siteConfig.defaultBookId);
  const book = loaded?.book ?? null;
  const lessons = loaded?.lessons ?? [];
  const eyebrow = book?.subtitle ?? book?.title ?? siteConfig.name;

  return (
    <Container width="wide">
      <Hero eyebrow={eyebrow} />
      <PathCards lessons={lessons} />
      {book ? <LessonsSection book={book} lessons={lessons} /> : null}
    </Container>
  );
}
