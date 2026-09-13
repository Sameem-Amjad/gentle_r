import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Container } from "./container";

export function SiteFooter() {
  return (
    <footer className="surface-glass mt-16 border-t border-border/60 py-8 text-sm text-muted">
      <Container width="wide" className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p>
          {siteConfig.name} · for adults {siteConfig.minimumAge}+ · no timers, no streaks.
        </p>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2">
          <Link className="hover:text-text" href={siteConfig.links.privacy}>
            Privacy
          </Link>
          <Link className="hover:text-text" href={siteConfig.links.terms}>
            Use policy
          </Link>
          <Link className="hover:text-text" href={siteConfig.links.help}>
            Help
          </Link>
          <a className="hover:text-text" href={`mailto:${siteConfig.supportEmail}`}>
            {siteConfig.supportEmail}
          </a>
        </nav>
      </Container>
    </footer>
  );
}
