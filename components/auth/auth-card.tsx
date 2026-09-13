import * as React from "react";
import { LeafMark } from "@/components/art/leaf-mark";
import { Card } from "@/components/ui";
import { cn } from "@/lib/utils";

interface AuthCardProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  eyebrow?: React.ReactNode;
  /** Replaces the leaf mark, e.g. a small illustration. */
  art?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

/**
 * The single glass card every auth screen lives in: a small mark, one h1,
 * one sentence of context, then the form or actions, then quiet footer links.
 */
export function AuthCard({ title, description, eyebrow, art, children, footer, className }: AuthCardProps) {
  return (
    <Card glass className={cn("overflow-hidden", className)}>
      <div className="px-6 pt-8 text-center sm:px-8">
        {art ?? <LeafMark className="mx-auto mb-5 size-11" />}
        {eyebrow ? (
          <p className="text-accent mb-2 text-sm font-medium tracking-[0.14em] uppercase">{eyebrow}</p>
        ) : null}
        <h1 className="text-text text-2xl sm:text-[1.75rem]">{title}</h1>
        {description ? <div className="text-muted mx-auto mt-3 max-w-prose">{description}</div> : null}
      </div>
      <div className="px-6 pt-6 pb-8 sm:px-8">{children}</div>
      {footer ? (
        <div className="border-border/70 bg-surface-2/50 text-muted border-t px-6 py-4 text-center text-sm sm:px-8">
          {footer}
        </div>
      ) : null}
    </Card>
  );
}
