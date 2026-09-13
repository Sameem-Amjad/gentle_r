import Link from "next/link";
import { Container } from "@/components/shell/container";
import { Button } from "@/components/ui/button";

export default function EntryNotFound() {
  return (
    <Container width="reading" className="py-16 text-center">
      <p className="text-accent text-sm font-medium tracking-[0.14em] uppercase">Not found</p>
      <h1 className="mt-2 text-3xl sm:text-4xl">This entry isn&apos;t here.</h1>
      <p className="text-muted mx-auto mt-4 max-w-prose text-lg">
        It may have been deleted, or the link may be old. Everything else in your journal is untouched.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/journal">Back to My Journal</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/journal/new">Start a new entry</Link>
        </Button>
      </div>
    </Container>
  );
}
