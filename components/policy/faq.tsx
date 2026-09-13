import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/** A list of expandable questions. Native details/summary; no JavaScript. */
export function Faq({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <ul
      role="list"
      className={cn(
        "divide-border border-border bg-surface shadow-soft divide-y rounded-lg border",
        className,
      )}
    >
      {children}
    </ul>
  );
}

export function FaqItem({ question, children }: { question: React.ReactNode; children: React.ReactNode }) {
  return (
    <li>
      <details className="group px-5 py-4">
        <summary className="text-text flex cursor-pointer list-none items-center justify-between gap-4 rounded-sm text-left font-medium [&::-webkit-details-marker]:hidden">
          <span>{question}</span>
          <ChevronDown
            className="text-muted size-5 shrink-0 transition-transform duration-200 group-open:rotate-180"
            aria-hidden="true"
          />
        </summary>
        <div className="text-muted [&_a]:text-primary mt-3 space-y-3 [&_a]:underline [&_a]:underline-offset-4">
          {children}
        </div>
      </details>
    </li>
  );
}
