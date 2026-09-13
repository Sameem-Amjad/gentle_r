import Link from "next/link";
import { Container } from "@/components/shell/container";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Container width="reading" className="py-16 text-center">
      <p className="text-sm font-medium uppercase tracking-[0.14em] text-accent">Not found</p>
      <h1 className="mt-2 text-3xl sm:text-4xl">This page isn&apos;t here.</h1>
      <p className="mx-auto mt-4 max-w-prose text-lg text-muted">
        The link may be old or mistyped. Nothing of yours has been lost.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/">Go home</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/lessons">Read a lesson</Link>
        </Button>
      </div>
    </Container>
  );
}
