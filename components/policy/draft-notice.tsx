import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Marks a policy page as draft wording. Kept visible until the owner supplies
 * or agrees the final text, so nobody mistakes placeholder copy for a
 * commitment.
 */
export function DraftNotice({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div
      role="note"
      className={cn(
        "border-tan-400/50 bg-accent-soft/60 text-text flex flex-col gap-2 rounded-md border px-4 py-3 text-sm sm:flex-row sm:items-start sm:gap-3",
        className,
      )}
    >
      <Badge tone="brown" className="shrink-0 self-start">
        Draft
      </Badge>
      <div className="space-y-1">
        <p>
          Draft wording. Final text is supplied or agreed by the owner before launch and must match what the
          app actually does.
        </p>
        {children ? <p className="text-muted">{children}</p> : null}
      </div>
    </div>
  );
}
