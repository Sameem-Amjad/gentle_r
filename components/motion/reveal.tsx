"use client";

import * as React from "react";
import { motion, type HTMLMotionProps, type Variants } from "motion/react";

const EASE = [0.22, 1, 0.36, 1] as const;

interface RevealProps extends HTMLMotionProps<"div"> {
  /** Seconds. */
  delay?: number;
  /** Pixels of upward travel. */
  y?: number;
  /** Animate when scrolled into view rather than on mount. */
  inView?: boolean;
  as?: "div" | "section" | "article" | "li" | "header" | "footer" | "span";
}

/** Fade + rise on mount (or in view). Respects the motion preference via MotionConfig. */
export function Reveal({ delay = 0, y = 14, inView = false, as = "div", children, ...props }: RevealProps) {
  const Comp = (motion as unknown as Record<string, typeof motion.div>)[as] ?? motion.div;
  const animation = inView
    ? { whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-10% 0px" } }
    : { animate: { opacity: 1, y: 0 } };
  return (
    <Comp
      initial={{ opacity: 0, y }}
      {...animation}
      transition={{ duration: 0.55, delay, ease: EASE }}
      {...props}
    >
      {children}
    </Comp>
  );
}

export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

/** Parent for a list of <StaggerItem>. */
export function Stagger({ children, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" {...props}>
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div variants={staggerItem} {...props}>
      {children}
    </motion.div>
  );
}

/** Subtle hover lift for cards and links. */
export const hoverLift = {
  whileHover: { y: -3 },
  whileTap: { y: 0, scale: 0.995 },
  transition: { type: "spring" as const, stiffness: 320, damping: 26 },
};
