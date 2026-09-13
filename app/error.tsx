"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/shell/container";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Only the digest is logged; never user content.
    console.error("Page error", error.digest ?? error.message);
  }, [error]);

  return (
    <Container width="reading" className="py-16 text-center">
      <p className="text-sm font-medium uppercase tracking-[0.14em] text-accent">Something went wrong</p>
      <h1 className="mt-2 text-3xl sm:text-4xl">We couldn&apos;t show this page.</h1>
      <p className="mx-auto mt-4 max-w-prose text-lg text-muted">
        Your saved writing is safe. You can try again, or go back home.
      </p>
      {error.digest ? <p className="mt-2 text-xs text-faint">Reference: {error.digest}</p> : null}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button asChild variant="secondary">
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </Container>
  );
}
