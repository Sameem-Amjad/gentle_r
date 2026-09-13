import { siteConfig } from "@/config/site";
import { Badge } from "@/components/ui/badge";
import type { LessonStatus } from "@/lib/content/schema";

/**
 * Small "Preview copy" marker for lessons whose JSON still carries
 * placeholder text. Controlled by siteConfig.features.showPlaceholderBadges
 * so it can be switched off once the supplied copy is in place.
 */
export function PlaceholderBadge({ status, className }: { status: LessonStatus; className?: string }) {
  if (status !== "placeholder" || !siteConfig.features.showPlaceholderBadges) return null;
  return (
    <Badge tone="brown" className={className}>
      Preview copy
    </Badge>
  );
}
