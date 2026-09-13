import { siteConfig } from "@/config/site";
import { Hummingbird } from "@/components/art/hummingbird";
import { Reveal } from "@/components/motion/reveal";

/**
 * Home hero. Text sits on a translucent cream surface so it stays readable
 * over the forest backdrop; the hummingbird is decorative and never overlaps
 * the copy (a small corner ornament on phones, beside the heading on sm+).
 */
export function Hero({ eyebrow }: { eyebrow: string }) {
  return (
    <Reveal as="section" aria-labelledby="hero-heading">
      <div className="surface-glass border-border/70 shadow-soft relative overflow-hidden rounded-xl border px-6 py-9 sm:px-10 sm:py-14 lg:px-14">
        <div className="grid items-center gap-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-10 lg:gap-16">
          <div className="max-w-2xl">
            <p className="text-accent text-sm font-medium tracking-[0.14em] uppercase">{eyebrow}</p>
            <h1 id="hero-heading" className="text-text mt-3 text-4xl sm:text-5xl lg:text-[3.5rem]">
              A quiet place to read, and to write.
            </h1>
            <p className="text-text mt-5 font-serif text-xl leading-snug sm:text-2xl">{siteConfig.tagline}</p>
            <p className="text-muted mt-3 max-w-prose text-lg">{siteConfig.description}</p>
          </div>

          <div
            aria-hidden="true"
            className="relative order-first w-20 justify-self-end sm:order-none sm:w-44 lg:w-56"
          >
            <div className="absolute -inset-[30%] rounded-full bg-[radial-gradient(closest-side,var(--cream-50)_0%,transparent_100%)] opacity-90 dark:opacity-20" />
            <Hummingbird className="relative h-auto w-full" />
          </div>
        </div>
      </div>
    </Reveal>
  );
}
