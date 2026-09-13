import * as React from "react";
import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/shell/container";

/**
 * Shared frame for the account screens: one narrow card, centred, with the
 * global header and footer left in place. Each page supplies its own
 * <AuthCard>, so the heading text always matches the task at hand.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Container width="narrow" className="flex flex-1 flex-col justify-center py-4 sm:py-8">
      <Reveal y={10}>{children}</Reveal>
    </Container>
  );
}
