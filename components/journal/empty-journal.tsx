import Link from "next/link";
import { PenLine } from "lucide-react";
import { Hummingbird } from "@/components/art/hummingbird";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/** Shown when the journal has no entries. Quiet, with one clear next step. */
export function EmptyJournal() {
  return (
    <Reveal delay={0.1}>
      <Card glass className="mx-auto max-w-lg px-6 py-10 text-center sm:px-10">
        <Hummingbird className="mx-auto w-28 sm:w-32" />
        <h2 className="mt-4 text-2xl">Nothing here yet.</h2>
        <p className="text-muted mt-2">What&apos;s on your mind?</p>
        <Button asChild className="mt-6">
          <Link href="/journal/new">
            <PenLine className="size-4" aria-hidden="true" />
            Start writing
          </Link>
        </Button>
      </Card>
    </Reveal>
  );
}
