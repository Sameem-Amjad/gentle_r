"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { hoverLift, StaggerItem } from "@/components/motion/reveal";
import { Card } from "@/components/ui/card";
import { wasEdited } from "@/lib/journal/export";
import type { EntryListEntry } from "@/lib/journal/schemas";
import { cn } from "@/lib/utils";
import { DeleteEntryButton } from "./delete-entry-button";
import { LocalDateTime, useLocalDateTime } from "./local-date-time";

/** One entry in the list: title (or its date) and when it was written. No body preview. */
export function EntryListItem({ entry }: { entry: EntryListEntry }) {
  const title = entry.title.trim();
  const createdLabel = useLocalDateTime(entry.created_at);
  const edited = wasEdited(entry.created_at, entry.updated_at);

  return (
    <StaggerItem role="listitem">
      <motion.div {...hoverLift}>
        <Card className="hover:shadow-lift relative transition-shadow duration-200">
          <Link href={`/journal/${entry.id}`} className="block rounded-lg py-4 pr-16 pl-5 sm:pl-6">
            <h2 className={cn("text-lg leading-snug sm:text-xl", title ? "text-text" : "text-muted")}>
              {title || createdLabel}
            </h2>
            <p className="text-muted mt-1 text-sm">
              <LocalDateTime value={entry.created_at} />
              {edited ? (
                <>
                  {" · edited "}
                  <LocalDateTime value={entry.updated_at} format="shortdate" />
                </>
              ) : null}
            </p>
          </Link>
          <div className="absolute top-1/2 right-3 -translate-y-1/2">
            <DeleteEntryButton entryId={entry.id} label={title || createdLabel} />
          </div>
        </Card>
      </motion.div>
    </StaggerItem>
  );
}
