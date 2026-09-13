import { Stagger } from "@/components/motion/reveal";
import type { EntryListEntry } from "@/lib/journal/schemas";
import { EntryListItem } from "./entry-list-item";

/** Newest first. The server already sorts; this only renders. */
export function EntryList({ entries }: { entries: EntryListEntry[] }) {
  return (
    <Stagger role="list" aria-label="Journal entries" className="grid gap-3">
      {entries.map((entry) => (
        <EntryListItem key={entry.id} entry={entry} />
      ))}
    </Stagger>
  );
}
