import * as React from "react";
import { cn } from "@/lib/utils";

/** One numbered-free section of a policy document. `id` is the anchor target. */
export function PolicySection({
  id,
  title,
  children,
  className,
}: {
  id: string;
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("scroll-mt-28", className)}>
      <h2 className="text-text text-2xl">{title}</h2>
      <div
        className={cn(
          "text-text mt-3 space-y-3 text-[1.0625rem] leading-[1.75]",
          "[&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5",
          "[&_a]:text-primary hover:[&_a]:text-primary-hover [&_a]:underline [&_a]:underline-offset-4",
        )}
      >
        {children}
      </div>
    </section>
  );
}

/**
 * A decision that is still open. Rendered in square brackets and lightly
 * highlighted so reviewers can find every unresolved detail at a glance.
 */
export function Pending({ children }: { children: React.ReactNode }) {
  return <mark className="bg-accent-soft text-accent rounded-sm px-1 font-medium">[{children}]</mark>;
}
