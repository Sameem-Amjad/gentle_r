"use client";

import * as React from "react";
import { formatDate, formatDateTime, formatTime } from "@/lib/utils";

/**
 * Dates rendered in the reader's own time zone without hydration mismatches.
 * The server (and the hydration pass) format in UTC; once hydrated the
 * client re-renders in local time.
 */

function subscribeNoop() {
  return () => {};
}

export function useHydrated(): boolean {
  return React.useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
}

export type DateFormat = "datetime" | "date" | "shortdate" | "time";

const UTC_OPTIONS: Record<DateFormat, Intl.DateTimeFormatOptions> = {
  datetime: {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  },
  date: { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" },
  shortdate: { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" },
  time: { hour: "2-digit", minute: "2-digit", timeZone: "UTC" },
};

function formatUtc(value: string, format: DateFormat): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", UTC_OPTIONS[format]).format(date);
}

/** "15 Sep 2026" in the local zone. */
function formatShortDate(date: Date): string {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function formatLocal(value: string, format: DateFormat): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  switch (format) {
    case "date":
      return formatDate(date);
    case "shortdate":
      return formatShortDate(date);
    case "time":
      return formatTime(date);
    default:
      return formatDateTime(date);
  }
}

/** Formatted date string that is safe to use in attributes such as aria-label. */
export function useLocalDateTime(value: string, format: DateFormat = "datetime"): string {
  const hydrated = useHydrated();
  return hydrated ? formatLocal(value, format) : formatUtc(value, format);
}

export function LocalDateTime({
  value,
  format = "datetime",
  className,
}: {
  value: string;
  format?: DateFormat;
  className?: string;
}) {
  const text = useLocalDateTime(value, format);
  return (
    <time dateTime={value} className={className}>
      {text}
    </time>
  );
}
