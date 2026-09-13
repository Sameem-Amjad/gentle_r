import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Inline text link used inside auth copy and footers. Looks like a link. */
export function AuthLink({ className, ...props }: React.ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(
        "text-primary hover:text-primary-hover rounded-sm font-medium underline underline-offset-4 transition-colors duration-200",
        className,
      )}
      {...props}
    />
  );
}
