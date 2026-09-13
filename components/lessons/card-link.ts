/**
 * "Stretched link" pattern: one link inside a card becomes the click target
 * for the whole card without wrapping the card in an <a>. Keeps the
 * accessible name short (just the link text) and lets secondary links inside
 * the card stay independently clickable by giving them `relative z-10`.
 *
 * Put `stretchedCardClasses` on the card and `stretchedLinkClasses` on the
 * primary link. The visible focus ring moves to the card.
 */
export const stretchedLinkClasses =
  "stretched-link after:absolute after:inset-0 after:rounded-[inherit] after:content-[''] focus-visible:outline-none";

export const stretchedCardClasses =
  "relative has-[.stretched-link:focus-visible]:outline-3 has-[.stretched-link:focus-visible]:outline-ring has-[.stretched-link:focus-visible]:outline-offset-2";
