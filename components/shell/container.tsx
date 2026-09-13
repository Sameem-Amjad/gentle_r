import * as React from "react";
import { cn } from "@/lib/utils";

type Width = "narrow" | "reading" | "default" | "wide";

const widths: Record<Width, string> = {
  narrow: "max-w-md",
  reading: "max-w-2xl",
  default: "max-w-4xl",
  wide: "max-w-6xl",
};

export function Container({
  className,
  width = "default",
  as: Comp = "div",
  ...props
}: React.HTMLAttributes<HTMLElement> & { width?: Width; as?: "div" | "section" | "main" | "article" | "header" | "footer" | "nav" }) {
  return <Comp className={cn("mx-auto w-full px-4 sm:px-6", widths[width], className)} {...props} />;
}
