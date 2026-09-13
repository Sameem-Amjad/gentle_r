"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Entry animations driven by CSS (see .reveal / .stagger in app/globals.css).
 *
 * Why CSS and not framer-motion here: the server HTML must never hide text.
 * A CSS animation that starts from opacity 0 runs on first paint even when
 * JavaScript is slow or disabled, so the page is always readable. The motion
 * preference (data-motion on <html>) reduces or removes these animations.
 */

type RevealTag = "div" | "section" | "article" | "li" | "header" | "footer" | "span" | "aside" | "nav";

export interface RevealProps extends React.HTMLAttributes<HTMLElement> {
  /** Seconds before the animation starts. Ignored for children of <Stagger>. */
  delay?: number;
  /** Pixels of upward travel. */
  y?: number;
  /**
   * Start when scrolled into view instead of on mount. Elements already in
   * view on mount animate immediately; elements below the fold wait. Without
   * JavaScript everything simply animates on load.
   */
  inView?: boolean;
  as?: RevealTag;
}

const IN_VIEW_MARGIN = "0px 0px -10% 0px";

/** Pauses a below-the-fold element until it scrolls into view (JS only). */
function useRevealInView(ref: React.RefObject<HTMLElement | null>, enabled: boolean) {
  React.useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (document.documentElement.getAttribute("data-motion") === "off") return;

    // Already visible (or nearly): let the on-load animation run.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) return;

    el.classList.add("reveal-wait");
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.classList.remove("reveal-wait");
          observer.disconnect();
        }
      },
      { rootMargin: IN_VIEW_MARGIN },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      el.classList.remove("reveal-wait");
    };
  }, [ref, enabled]);
}

/** Fade + rise on mount (or when scrolled into view). */
export function Reveal({ delay = 0, y = 14, inView = false, as = "div", className, style, children, ...props }: RevealProps) {
  const ref = React.useRef<HTMLElement | null>(null);
  useRevealInView(ref, inView);
  const Tag = as as React.ElementType;
  return (
    <Tag
      ref={ref}
      className={cn("reveal", className)}
      style={{ "--reveal-delay": `${delay}s`, "--reveal-y": `${y}px`, ...style } as React.CSSProperties}
      {...props}
    >
      {children}
    </Tag>
  );
}

export interface StaggerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Seconds before the first child starts. */
  delay?: number;
  /** Seconds between children. */
  step?: number;
  /** Start when scrolled into view. */
  inView?: boolean;
}

/**
 * Parent for a list of <StaggerItem> (or any descendant with class "reveal").
 * Direct children receive increasing delays via CSS :nth-child rules, so the
 * items themselves need no index.
 */
export function Stagger({ delay = 0.05, step = 0.07, inView = false, className, style, children, ...props }: StaggerProps) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  useRevealInView(ref, inView);
  return (
    <div
      ref={ref}
      className={cn("stagger", className)}
      style={{ "--stagger-base": `${delay}s`, "--stagger-step": `${step}s`, ...style } as React.CSSProperties}
      {...props}
    >
      {children}
    </div>
  );
}

export function StaggerItem({ className, y = 12, style, children, ...props }: React.HTMLAttributes<HTMLDivElement> & { y?: number }) {
  return (
    <div
      className={cn("reveal", className)}
      style={{ "--reveal-y": `${y}px`, ...style } as React.CSSProperties}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Subtle hover lift for cards and links. Spread onto a framer `motion.div`.
 * This is progressive: without JavaScript there is simply no lift.
 */
export const hoverLift = {
  whileHover: { y: -3 },
  whileTap: { y: 0, scale: 0.995 },
  transition: { type: "spring" as const, stiffness: 320, damping: 26 },
};
