import { Leaf } from "lucide-react";
import type { Lesson } from "@/lib/content/schema";
import { Card } from "@/components/ui/card";
import { ContentBlocks } from "./content-blocks";

/**
 * The lesson's one small, optional action. Read-only and phrased as an
 * invitation; there is nothing to tick off.
 */
export function SmallActionCard({ action }: { action: Lesson["smallAction"] }) {
  return (
    <Card
      className="border-tan-400/40 bg-accent-soft shadow-soft px-6 py-6 sm:px-8 sm:py-7"
      aria-labelledby="small-action-heading"
      role="region"
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="bg-surface/70 text-accent flex size-10 shrink-0 items-center justify-center rounded-md"
        >
          <Leaf className="size-5" />
        </span>
        <h2 id="small-action-heading" className="text-text text-2xl">
          {action.title}
        </h2>
      </div>
      <div className="prose-lesson text-text mt-4">
        <ContentBlocks blocks={action.blocks} headingLevel={3} />
      </div>
      <p className="text-muted mt-5 text-sm">
        An invitation, not a task. Leave it for another day if today is full.
      </p>
    </Card>
  );
}
