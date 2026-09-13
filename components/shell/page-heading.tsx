import * as React from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/reveal";

interface PageHeadingProps {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  align?: "left" | "center";
}

export function PageHeading({ eyebrow, title, description, actions, className, align = "left" }: PageHeadingProps) {
  return (
    <Reveal as="header" className={cn("mb-8 sm:mb-10", align === "center" && "text-center", className)}>
      {eyebrow ? <p className="mb-2 text-sm font-medium uppercase tracking-[0.14em] text-accent">{eyebrow}</p> : null}
      <h1 className="text-3xl text-text sm:text-4xl md:text-[2.75rem]">{title}</h1>
      {description ? <p className={cn("mt-3 max-w-prose text-lg text-muted", align === "center" && "mx-auto")}>{description}</p> : null}
      {actions ? <div className={cn("mt-6 flex flex-wrap gap-3", align === "center" && "justify-center")}>{actions}</div> : null}
    </Reveal>
  );
}
