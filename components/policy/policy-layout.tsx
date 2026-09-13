import * as React from "react";
import { Container } from "@/components/shell/container";
import { PageHeading } from "@/components/shell/page-heading";
import { Reveal } from "@/components/motion/reveal";
import { DraftNotice } from "./draft-notice";
import { LastUpdated } from "./last-updated";

export interface PolicyTocItem {
  id: string;
  title: string;
}

interface PolicyLayoutProps {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Calendar date "YYYY-MM-DD". */
  lastUpdated: string;
  /** Anchors for the in-page table of contents, in reading order. */
  toc: PolicyTocItem[];
  /** Extra sentence shown under the draft notice. */
  draftNote?: React.ReactNode;
  children: React.ReactNode;
}

function TocList({ items }: { items: PolicyTocItem[] }) {
  return (
    <ol className="border-border space-y-1.5 border-l pl-3 text-sm">
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            className="text-muted hover:text-text block rounded-sm py-0.5 transition-colors duration-200"
          >
            {item.title}
          </a>
        </li>
      ))}
    </ol>
  );
}

/**
 * Two-column document layout for the privacy notice and use policy: a
 * sticky table of contents on wide screens, a collapsible one on phones, and
 * the draft notice at the top of the document. No scripts are needed.
 */
export function PolicyLayout({
  eyebrow,
  title,
  description,
  lastUpdated,
  toc,
  draftNote,
  children,
}: PolicyLayoutProps) {
  return (
    <Container>
      <PageHeading eyebrow={eyebrow} title={title} description={description} />

      <Reveal delay={0.05} className="space-y-4">
        <DraftNotice>{draftNote}</DraftNotice>
        <LastUpdated date={lastUpdated} />
      </Reveal>

      <Reveal
        delay={0.1}
        className="mt-8 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:items-start lg:gap-12"
      >
        <aside className="hidden lg:block">
          <nav aria-label="On this page" className="sticky top-24">
            <p className="text-faint text-xs font-medium tracking-[0.14em] uppercase">On this page</p>
            <div className="mt-3">
              <TocList items={toc} />
            </div>
          </nav>
        </aside>

        <details className="border-border bg-surface shadow-soft mb-8 rounded-md border px-4 py-3 lg:hidden">
          <summary className="text-text cursor-pointer text-sm font-medium">On this page</summary>
          <nav aria-label="On this page" className="mt-3">
            <TocList items={toc} />
          </nav>
        </details>

        <article className="min-w-0 space-y-10">{children}</article>
      </Reveal>
    </Container>
  );
}
