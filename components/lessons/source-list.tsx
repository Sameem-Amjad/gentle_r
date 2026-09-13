import { ExternalLink } from "lucide-react";
import type { SourceLink } from "@/lib/content/schema";

/** External reading behind a lesson. Rendered once, after the teaching. */
export function SourceList({ sources }: { sources: SourceLink[] }) {
  if (sources.length === 0) return null;
  return (
    <section aria-labelledby="sources-heading">
      <h2 id="sources-heading" className="text-text text-2xl">
        Sources
      </h2>
      <p className="text-muted mt-2 text-sm">Reading behind this lesson. Links open in a new tab.</p>
      <ul className="divide-border/70 border-border bg-surface/70 mt-4 divide-y overflow-hidden rounded-lg border">
        {sources.map((source) => (
          <li key={source.url} className="px-4 py-3.5 sm:px-5">
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary inline-flex items-start gap-2 font-medium underline-offset-4 hover:underline"
            >
              <span>{source.label}</span>
              <ExternalLink aria-hidden="true" className="text-muted mt-1 size-4 shrink-0" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
            {source.note ? <p className="text-muted mt-1 text-sm">{source.note}</p> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
