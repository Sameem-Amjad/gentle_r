import { cn, formatDate } from "@/lib/utils";

/**
 * "Last updated" line for policy pages. Takes a calendar date as
 * "YYYY-MM-DD" and formats it in the local calendar so the shown day never
 * shifts with the server's time zone.
 */
export function LastUpdated({ date, className }: { date: string; className?: string }) {
  const [year, month, day] = date.split("-").map(Number);
  const local = new Date(year, month - 1, day);
  return (
    <p className={cn("text-muted text-sm", className)}>
      Last updated: <time dateTime={date}>{formatDate(local)}</time>
    </p>
  );
}
