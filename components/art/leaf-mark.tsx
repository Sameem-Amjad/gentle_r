import { cn } from "@/lib/utils";

/** Small leaf logo mark used in the header and favicon. */
export function LeafMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8", className)} aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="var(--primary)" />
      <path
        d="M9 23c0-8 5-13 14-14-0.5 9-5.5 14-14 14Z"
        fill="var(--primary-fg)"
        opacity="0.95"
      />
      <path d="M9.5 22.5C13 18 17 14.5 22.5 9.5" stroke="var(--primary)" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
