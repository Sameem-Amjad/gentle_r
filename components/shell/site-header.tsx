import Link from "next/link";
import { CircleQuestionMark } from "lucide-react";
import { siteConfig } from "@/config/site";
import { LeafMark } from "@/components/art/leaf-mark";
import { Button } from "@/components/ui/button";
import { DisplaySettings } from "@/components/preferences/display-settings";
import { Container } from "./container";
import { AccountButton } from "./account-button";
import { NavLink } from "./nav-link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 surface-glass">
      <Container width="wide" className="flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 rounded-md py-1 pr-2" aria-label={`${siteConfig.name} home`}>
            <LeafMark />
            <span className="font-serif text-xl tracking-tight text-text">{siteConfig.name}</span>
          </Link>
          <nav aria-label="Primary" className="hidden items-center gap-1 sm:flex">
            <NavLink href="/lessons">Lessons</NavLink>
            <NavLink href="/journal">My Journal</NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-1">
          {siteConfig.features.displaySettings ? <DisplaySettings /> : null}
          <Button asChild variant="ghost" size="icon">
            <Link href={siteConfig.links.help} aria-label="Help">
              <CircleQuestionMark className="size-5" aria-hidden="true" />
            </Link>
          </Button>
          <AccountButton />
        </div>
      </Container>

      {/* Compact nav on narrow screens */}
      <nav aria-label="Primary (mobile)" className="border-t border-border/60 sm:hidden">
        <Container width="wide" className="flex h-11 items-center gap-1">
          <NavLink href="/lessons">Lessons</NavLink>
          <NavLink href="/journal">My Journal</NavLink>
        </Container>
      </nav>
    </header>
  );
}
