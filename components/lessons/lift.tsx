"use client";

import * as React from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { Stagger, hoverLift, type StaggerProps } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

/**
 * Client-side motion wrappers for the lessons and home cards. Server
 * components cannot spread `hoverLift` themselves (it would arrive as a
 * client reference), so these small components do it for them. Hover lifts
 * follow the user's motion preference through MotionConfig; the entry
 * reveal is CSS (class "reveal") so nothing is hidden without JavaScript.
 */

/** Gentle hover lift for a single card. */
export function Lift({ children, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div {...hoverLift} {...props}>
      {children}
    </motion.div>
  );
}

/** Stagger child (CSS reveal) that also lifts on hover. */
export function LiftStaggerItem({ children, className, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div {...hoverLift} className={cn("reveal", className)} {...props}>
      {children}
    </motion.div>
  );
}

/** Parent for a list of LiftStaggerItem, optionally triggered in view. */
export function StaggerGroup({ inView = false, delay = 0.05, children, ...props }: StaggerProps) {
  return (
    <Stagger inView={inView} delay={delay} {...props}>
      {children}
    </Stagger>
  );
}
