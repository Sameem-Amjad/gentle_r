/**
 * Site-wide, non-secret configuration.
 *
 * Everything here is safe to ship to the browser. Change values in this file
 * (or the matching NEXT_PUBLIC_* environment variables) to re-brand or
 * re-point the app without touching feature code.
 */
export const siteConfig = {
  /** Public working name. Final public name is still to be confirmed by Jonathan. */
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? "GentleR",
  tagline: "Three quiet lessons and one private journal.",
  description:
    "A calm place to read three short lessons and keep a private journal. No timers, no streaks, no pressure to finish.",
  /** Canonical origin used in emails and absolute links. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://app.jonathankawira.com",
  /** Support address shown on the Help page and in footers. */
  supportEmail:
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@jonathankawira.com",
  /** Owner shown on policy pages. */
  ownerName: "Jonathan Kawira",
  /** Minimum age stated on registration and policy pages. */
  minimumAge: 18,
  /** Default book shown on the Home page and lesson list. */
  defaultBookId: "gentler",
  /**
   * Feature toggles. Deferred items from the brief stay off; they exist so a
   * later developer can see where an optional feature would plug in.
   */
  features: {
    /** Show a small "preview copy" badge on lessons whose JSON has status "placeholder". */
    showPlaceholderBadges: true,
    /** Default motion preference for first-time visitors. Users can change it. */
    defaultMotion: "system" as "system" | "full" | "reduced" | "off",
    /** Default theme for first-time visitors. */
    defaultTheme: "system" as "system" | "light" | "dark",
    /** Allow the visible display-settings control in the header. */
    displaySettings: true,
  },
  /** Journal behaviour that the owner may want to tune. */
  journal: {
    /** Milliseconds of typing silence before an automatic save. */
    autosaveDelayMs: 1200,
    /** Milliseconds between automatic retries after a failed save. */
    retryDelayMs: 8000,
    /** Soft ceiling for one entry body (characters). Server also enforces it. */
    maxBodyChars: 100_000,
    maxTitleChars: 200,
  },
  links: {
    privacy: "/privacy",
    terms: "/terms",
    help: "/help",
  },
} as const;

export type SiteConfig = typeof siteConfig;
